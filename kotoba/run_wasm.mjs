#!/usr/bin/env node
// Instantiate a kotoba-compiled wasm module and run vendored fixtures.
// Two instances: wasm fuel is per-instance, and encode+decode together overflow it.
import { readFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("usage: node run_wasm.mjs <file.wasm>");
  process.exit(2);
}

const buf = readFileSync(path);
if (buf.length < 4 || buf[0] !== 0x00 || buf[1] !== 0x61 || buf[2] !== 0x73 || buf[3] !== 0x6d) {
  console.error("not a wasm module (missing magic)");
  process.exit(1);
}

const module = new WebAssembly.Module(buf);
const imports = WebAssembly.Module.imports(module);
if (imports.length !== 0) {
  console.error("wasm module has imports (not host-independent):", imports);
  process.exit(1);
}

const encodeInst = new WebAssembly.Instance(module);
if (typeof encodeInst.exports.main !== "function") {
  console.error("wasm module has no main export");
  process.exit(1);
}

const encodeCode = encodeInst.exports.main();
if (encodeCode !== 0n && encodeCode !== 0) {
  console.error("encode fixtures failed, main returned", encodeCode);
  process.exit(1);
}
const seven = encodeInst.exports["encode-char"](20375000n, 2775000n, 6n, 0n);
if (seven !== 55n && seven !== 55) {
  console.error("encode-char fixture failed, got", seven, "expected 55 (7)");
  process.exit(1);
}
console.log("encode fixtures passed (main === 0)");

const decode = [
  [3472364618834724407n, 43n, 20350000n, 2750000n, 20400000n, 2800000n, 6n],
  [3617008642191410744n, 3289643n, 47000000n, 8000000n, 47000125n, 8000125n, 10n],
  [3472328296262742582n, 43n, 0n, -180000000n, 1000000n, -179000000n, 4n],
  [3472328296261366322n, 43n, -90000000n, -180000000n, -89000000n, -179000000n, 4n],
  [3472328296296302135n, 43n, 20000000n, 2000000n, 21000000n, 3000000n, 4n],
  [3472328296900286006n, 43n, 0n, 179000000n, 1000000n, 180000000n, 4n],
  [3617008641922057782n, 842150443n, 1000000n, 1000000n, 1000025n, 1000031n, 11n],
  [3472328296280639043n, 43n, 89000000n, 1000000n, 90000000n, 2000000n, 4n],
  [3472328296262808118n, 43n, 1000000n, -180000000n, 2000000n, -179000000n, 4n],
  [3472328296279585334n, 43n, 1000000n, -179000000n, 2000000n, -178000000n, 4n],
  [3627704854246868547n, 3299371n, 89999875n, 1000000n, 90000000n, 1000125n, 10n],
  [3472328296227681336n, 43n, 30000000n, -140000000n, 50000000n, -120000000n, 2n],
];

const decodeInst = new WebAssembly.Instance(module);
const fns = ["decode-lat-lo", "decode-lng-lo", "decode-lat-hi", "decode-lng-hi", "decode-len"];
for (let i = 0; i < decode.length; i++) {
  const [w0, w1, ...exp] = decode[i];
  const got = fns.map((name) => decodeInst.exports[name](w0, w1));
  for (let j = 0; j < exp.length; j++) {
    if (got[j] !== exp[j]) {
      console.error(`decode fixture ${i} field ${fns[j]}: got ${got[j]}, expected ${exp[j]}`);
      process.exit(1);
    }
  }
}
console.log("decode fixtures passed");
console.log("kotoba wasm fixtures passed");
