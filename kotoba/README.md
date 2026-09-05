# Kotoba library for Open Location Code

This is a Plus Code (Open Location Code) encode/decode binding for
[Kotoba](https://github.com/kotoba-lang/kotoba) CLI v0.7.2.

Kotoba cannot FFI. The implementation is self-contained in
`openlocationcode.kotoba` and compiles to host-independent wasm32 (`i64-v1`).

## Integers only (microdegrees)

The v0.7.2 wasm32 backend has no IEEE floats. Coordinates are **microdegrees**
(`i64`): 1 unit = 1e-6 degree. A Plus Code is two little-endian i64 words of
ASCII (word 0 = chars 0–7, word 1 = chars 8–15; unused bytes are 0).

This matches the integer path in `go/encode.go` / `go/decode.go`, not the
float `Encode`/`Decode` wrappers in other language directories.

## Public API

| Function | Arguments | Result |
| --- | --- | --- |
| `encode-word` | `lat-udeg`, `lng-udeg`, `code-len`, `word-ix` | packed ASCII word (`0` or `1`) |
| `encode-char` | `lat-udeg`, `lng-udeg`, `code-len`, `pos` | ASCII code unit |
| `decode-lat-lo` / `decode-lng-lo` | `w0`, `w1` | south-west corner, microdegrees |
| `decode-lat-hi` / `decode-lng-hi` | `w0`, `w1` | north-east corner, microdegrees |
| `decode-len` | `w0`, `w1` | significant digit count |
| `main` | (none) | `0` if vendored fixtures pass |

v1 covers full-code encode/decode only (no shorten/recover).

## Testing

From this directory, with kotoba CLI v0.7.2 and Node.js on `PATH`:

```
bash checks.sh
```

`checks.sh` compiles `openlocationcode.kotoba` to wasm, checks the module has
wasm magic and no imports, instantiates it twice (wasm fuel is per-instance),
requires `main() === 0` for encode fixtures, then calls the decode exports
against the vendored vectors.

Fixtures in `testdata/` are a subset of `../test_data/encoding.csv` and
`../test_data/decoding.csv`, converted to microdegrees.

## Compile

```
kotoba compile openlocationcode.kotoba --target wasm --output openlocationcode.wasm --json
```
