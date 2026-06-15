const [currentMajor, currentMinor, currentPatch] = process.versions.node
  .split(".")
  .map((part) => Number.parseInt(part, 10));

const isSupported =
  currentMajor > 22 ||
  (currentMajor === 22 &&
    (currentMinor > 15 || (currentMinor === 15 && currentPatch >= 0)));

if (!isSupported) {
  console.error(
    `This project must run on Node 22.15.0 or newer. Current Node version: ${process.version}.\n` +
      "Switch to Node 22.15.0, then run npm run dev:fresh again.",
  );
  process.exit(1);
}
