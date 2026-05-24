const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const sizeOf = require("image-size");

const repoRoot = path.join(__dirname, "..");
const mobileRoot = path.join(repoRoot, "apps/mobile");
const unionPath = path.join(
  repoRoot,
  "apps/server/src/assets/us-license-plates-union.json",
);
const serverPlatesDir = path.join(repoRoot, "apps/server/src/assets/plates");
const outJsonPath = path.join(mobileRoot, "assets/data/bundled-plates.json");
const outPlatesDir = path.join(mobileRoot, "assets/plates-bundled");
const outMapPath = path.join(mobileRoot, "src/bundledPlateImages.ts");
const mapFileDir = path.dirname(outMapPath);

const MAX_PER_STATE = 20;

const MILITARY_TITLE =
  /\b(veteran|veterans|military|army|navy|air force|airforce|marine|marines|national guard|medal|cross|infantry|division|brigade|cavalry|regiment|submarine|battalion|armed forces|coast guard|pearl harbor|pow\b|prisoner of war|honorably discharged|distinguished flying|bronze star|silver star|purple heart|defense medal|memorial|fallen soldier|wounded warrior)\b/i;

const SPECIALTY_TITLE =
  /\b(university|college|alumni|fraternity|sorority|firefighter|police officer|rotary|lions club|shriners|knights of|cattlemen|scout|scouting|autism|cancer|diabetes|choose life|pro-life|organ donor|donate life|humane society|alpha kappa|alpha phi|beta |sigma |zeta |kappa |omega |phi )\b/i;

function scorePlate(plate) {
  let score = 40;
  if (plate.category === "Standard") score += 100;
  if (plate.category === "Military") score -= 200;
  if (MILITARY_TITLE.test(plate.plate_title)) score -= 150;
  if (SPECIALTY_TITLE.test(plate.plate_title)) score -= 40;
  if (/\b(standard|passenger|general issue|current issue)\b/i.test(plate.plate_title)) {
    score += 50;
  }
  if (/\/standard\//i.test(plate.source_img || "")) score += 30;
  if (/apportioned|commercial|trailer|fleet|for hire|low speed|dealer/i.test(plate.plate_title)) {
    score -= 35;
  }
  return score;
}

function pickPlatesForState(plates) {
  const ranked = plates
    .map((p) => ({ plate: p, score: scorePlate(p) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.plate.plate_title.localeCompare(b.plate.plate_title));

  const seen = new Set();
  const picked = [];
  for (const { plate } of ranked) {
    const key = `${plate.state}|${plate.plate_img}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(plate);
    if (picked.length >= MAX_PER_STATE) break;
  }

  if (picked.length < MAX_PER_STATE) {
    for (const plate of plates) {
      const key = `${plate.state}|${plate.plate_img}`;
      if (seen.has(key)) continue;
      if (plate.category === "Military" || MILITARY_TITLE.test(plate.plate_title)) {
        continue;
      }
      seen.add(key);
      picked.push(plate);
      if (picked.length >= MAX_PER_STATE) break;
    }
  }

  return picked;
}

function normalizeDestFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  let base = path.basename(filename, path.extname(filename));
  base = base.replace(/%20/gi, " ").replace(/\s+/g, "_");
  return `${base}${ext}`;
}

function resolveSourceFile(state, plateImg) {
  const dir = path.join(serverPlatesDir, state);
  if (!fs.existsSync(dir)) {
    return null;
  }
  const exact = path.join(dir, plateImg);
  if (fs.existsSync(exact)) {
    return exact;
  }
  const target = plateImg.toLowerCase();
  const match = fs.readdirSync(dir).find((name) => name.toLowerCase() === target);
  return match ? path.join(dir, match) : null;
}

function isMetroCompatibleImage(filePath) {
  try {
    sizeOf(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Re-encode images Metro cannot parse (e.g. CMYK JPEG, heavy Photoshop metadata). */
function repairImageForMetro(filePath) {
  if (process.platform !== "darwin") {
    return false;
  }

  const trySipsToJpeg = (inputPath, outputPath) => {
    execFileSync(
      "sips",
      [
        "-s",
        "format",
        "jpeg",
        "-s",
        "formatOptions",
        "85",
        inputPath,
        "--out",
        outputPath,
      ],
      { stdio: "ignore" },
    );
  };

  const tmpJpeg = `${filePath}.metro-repair.jpg`;
  const tmpPng = `${filePath}.metro-repair.png`;

  try {
    trySipsToJpeg(filePath, tmpJpeg);
    fs.copyFileSync(tmpJpeg, filePath);
    fs.unlinkSync(tmpJpeg);
    if (isMetroCompatibleImage(filePath)) {
      return true;
    }

    execFileSync("sips", ["-s", "format", "png", filePath, "--out", tmpPng], {
      stdio: "ignore",
    });
    trySipsToJpeg(tmpPng, filePath);
    fs.unlinkSync(tmpPng);
    return isMetroCompatibleImage(filePath);
  } catch {
    for (const tmp of [tmpJpeg, tmpPng]) {
      if (fs.existsSync(tmp)) {
        fs.unlinkSync(tmp);
      }
    }
    return false;
  }
}

function copyPlateImage(state, plateImg) {
  const src = resolveSourceFile(state, plateImg);
  if (!src) {
    return null;
  }
  const destName = normalizeDestFilename(path.basename(src));
  const destDir = path.join(outPlatesDir, state);
  const destPath = path.join(destDir, destName);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, destPath);

  if (!isMetroCompatibleImage(destPath)) {
    if (!repairImageForMetro(destPath)) {
      fs.unlinkSync(destPath);
      console.warn(
        `Skipping Metro-incompatible image: ${state}/${destName} (invalid or unsupported encoding)`,
      );
      return null;
    }
    console.warn(`Re-encoded for Metro: ${state}/${destName}`);
  }

  return destName;
}

function toRequirePath(absolutePath) {
  const rel = path.relative(mapFileDir, absolutePath).split(path.sep).join("/");
  if (!rel.startsWith(".")) {
    return `./${rel}`;
  }
  return rel;
}

function escapeForTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function main() {
  if (!fs.existsSync(unionPath)) {
    console.error("Missing union JSON:", unionPath);
    process.exit(1);
  }

  const union = JSON.parse(fs.readFileSync(unionPath, "utf-8"));
  const byState = {};
  for (const plate of union) {
    (byState[plate.state] ??= []).push(plate);
  }

  if (fs.existsSync(outPlatesDir)) {
    fs.rmSync(outPlatesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outPlatesDir, { recursive: true });

  const states = {};
  const mapEntries = [];
  let copied = 0;
  let missingFiles = 0;
  const perStateCounts = [];

  for (const state of Object.keys(byState).sort()) {
    const picked = pickPlatesForState(byState[state]);
    const withFiles = [];
    for (const plate of picked) {
      const destName = copyPlateImage(state, plate.plate_img);
      if (!destName) {
        missingFiles += 1;
        console.warn(`Missing image: ${state}/${plate.plate_img}`);
        continue;
      }
      const destAbs = path.join(outPlatesDir, state, destName);
      const stored = { ...plate, plate_img: destName };
      withFiles.push(stored);
      copied += 1;
      mapEntries.push({
        state,
        plate_img: destName,
        requirePath: toRequirePath(destAbs),
      });
    }
    states[state] = withFiles;
    perStateCounts.push({ state, count: withFiles.length });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    maxPerState: MAX_PER_STATE,
    states,
    stats: {
      states: Object.keys(states).length,
      totalPlates: Object.values(states).reduce((n, arr) => n + arr.length, 0),
      imagesCopied: copied,
      missingImages: missingFiles,
    },
  };

  fs.mkdirSync(path.dirname(outJsonPath), { recursive: true });
  fs.writeFileSync(outJsonPath, JSON.stringify(manifest, null, 2));

  const mapLines = [
    "/* eslint-disable @typescript-eslint/no-require-imports */",
    "/* Auto-generated by scripts/build-bundled-plates.js — do not edit. */",
    "import { ImageSourcePropType } from \"react-native\";",
    "",
    "const bundledImages: Record<string, Record<string, ImageSourcePropType>> = {",
  ];

  const byStateMap = {};
  for (const { state, plate_img, requirePath } of mapEntries) {
    (byStateMap[state] ??= []).push({ plate_img, requirePath });
  }

  for (const state of Object.keys(byStateMap).sort()) {
    mapLines.push(`  ${state}: {`);
    for (const { plate_img, requirePath } of byStateMap[state]) {
      mapLines.push(
        `    "${escapeForTs(plate_img)}": require("${escapeForTs(requirePath)}"),`,
      );
    }
    mapLines.push("  },");
  }
  mapLines.push("};");
  mapLines.push("");
  mapLines.push(
    "export function getBundledImageSource(",
    "  state: string,",
    "  plateImg: string,",
    "): ImageSourcePropType | null {",
    "  return bundledImages[state]?.[plateImg] ?? null;",
    "}",
    "",
  );

  fs.mkdirSync(path.dirname(outMapPath), { recursive: true });
  fs.writeFileSync(outMapPath, mapLines.join("\n"));

  if (fs.existsSync(path.join(mobileRoot, "src/services/plates/bundledImageMap.ts"))) {
    fs.unlinkSync(path.join(mobileRoot, "src/services/plates/bundledImageMap.ts"));
  }

  console.log("Bundled plates written:", outJsonPath);
  console.log("Image map written:", outMapPath);
  console.log("Images copied:", copied, "to", outPlatesDir);
  console.log("Stats:", manifest.stats);
  console.log(
    "States under 20:",
    perStateCounts
      .filter((x) => x.count < 20)
      .map((x) => `${x.state}(${x.count})`)
      .join(", "),
  );
}

main();
