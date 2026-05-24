import fs from "fs";
import path from "path";

const limitJsonFile = path.join(
  "",
  "apps/server/src/assets/us-license-plates.json",
);

const catsJsonFile = path.join(
  "",
  "apps/server/src/assets/us-license-plates-categorized.json",
);
console.log("Reading JSON file from:", limitJsonFile);
const limitJson = JSON.parse(fs.readFileSync(limitJsonFile, "utf-8"));
console.log("JSON file read successfully.", limitJsonFile.data);

const catsJson = JSON.parse(fs.readFileSync(catsJsonFile, "utf-8"));

const data = limitJson.data.map((item) => {
  const category = catsJson.data.find(
    (cat) => cat.plate_title === item.plate_title && cat.state === item.state,
  );
  return {
    ...item,
    category: category ? category.category : "Uncategorized",
  };
});

fs.writeFileSync(
  "apps/server/src/assets/us-license-plates-union.json",
  JSON.stringify(data, null, 2),
);
console.log("Limited JSON file created successfully.");
