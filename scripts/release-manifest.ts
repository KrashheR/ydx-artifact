import { writeFileSync } from "node:fs";

writeFileSync(
  "release-manifest.json",
  JSON.stringify(
    {
      version: "0.1.0",
      generatedAt: new Date().toISOString(),
      entry: "index.html",
      platform: "yandex-games",
      locales: ["ru", "en"]
    },
    null,
    2
  )
);
console.log("release-manifest.json generated");
