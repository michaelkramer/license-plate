// Run this script with `node convert-csv-to-json.js` in your project root
// It will read us-license-plates.csv and write us-license-plates.json in the same folder

const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

const csvPath = path.join(__dirname, "src/assets/us-license-plates.csv");
const jsonPath = path.join(__dirname, "src/assets/us-license-plates.json");

const csvString = fs.readFileSync(csvPath, "utf8");
const result = Papa.parse(csvString, { header: true });

fs.writeFileSync(jsonPath, JSON.stringify(result.data, null, 2));

console.log("Converted CSV to JSON:", jsonPath);
