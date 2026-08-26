const Database = require("better-sqlite3");
const { join } = require("path");
const { copyFileSync } = require("fs");
const tmp = join(process.env.TEMP, "opencode", "phoco-sync.db");
copyFileSync(tmp, join(__dirname, "phoco-sync.db"));
const db = new Database(join(__dirname, "phoco-sync.db"));
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%ier%'").all().map(r => r.name);
console.log("tier tables:", JSON.stringify(tables));
const table = tables.includes("ChestTier") ? "ChestTier" : tables[0];
const map = { common: "#9a3b2b", gold: "#c9962b", epic: "#b3122e", grand: "#1f5c46" };
for (const [key, hex] of Object.entries(map)) {
  const r = db.prepare("UPDATE " + table + " SET colorHex=? WHERE key=?").run(hex, key);
  console.log(key, "->", hex, "rows:", r.changes);
}
console.log("after:", JSON.stringify(db.prepare("SELECT key, colorHex FROM " + table).all()));
db.close();
copyFileSync(join(__dirname, "phoco-sync.db"), tmp);
console.log("synced back to", tmp);
