import { readFileSync, writeFileSync } from "node:fs";
const path = new URL("../docs/assets-inventory.json", import.meta.url);
const parsed = JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
const expand = (item) =>
  Array.isArray(item)
    ? item.flatMap(expand)
    : Array.isArray(item?.value)
      ? item.value.flatMap(expand)
      : item?.file
        ? [item]
        : [];
const rows = expand(parsed);
writeFileSync(path, JSON.stringify(rows, null, 2) + "\n");
