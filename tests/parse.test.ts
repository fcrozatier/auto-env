import { assertEquals, unreachable } from "@std/assert";
import { assert } from "@std/assert/assert";
import { inlineComment, parse } from "$/src/parse.ts";
import { ERROR_MESSAGE } from "$/src/constants.ts";

Deno.test("handles basic syntax", () => {
  const [row] = parse("KEY=value");

  assertEquals(row, ["KEY", "value"]);
});

Deno.test("handles spaces around = sign", () => {
  const [row] = parse("KEY =   value");

  assertEquals(row, ["KEY", "value"]);
});

Deno.test("ignores comments", () => {
  const r = inlineComment.parseOrThrow("# a comment");

  assertEquals(r, "");
});

Deno.test("ignores inline comments", () => {
  const [row] = parse("KEY=value # a comment");

  assertEquals(row, ["KEY", "value"]);
});

Deno.test("handles booleans", () => {
  const rows = parse(`DEV=true\n PROD=false`);

  assertEquals(rows, [["DEV", true], ["PROD", false]]);
});

Deno.test("handles numbers", () => {
  const [row] = parse(`PORT=3000`);

  assertEquals(row, ["PORT", 3000]);
});

Deno.test("handles double quotes", () => {
  const [row] = parse(`KEY="multi\nline space # hashtag "`);

  assertEquals(row, [
    "KEY",
    "multi\nline space # hashtag ",
  ]);
});

Deno.test("handles multiline", () => {
  const [row] = parse(`PRIVATE_KEY="-----BEGIN RSA KEY-----
MIIBogIBAAJBALRiMLAH...
-----END RSA KEY-----"`);

  assertEquals(row, [
    "PRIVATE_KEY",
    `-----BEGIN RSA KEY-----
MIIBogIBAAJBALRiMLAH...
-----END RSA KEY-----`,
  ]);
});

Deno.test("handles missing values", () => {
  const [row] = parse(`PRIVATE_KEY=`);

  assertEquals(row, ["PRIVATE_KEY", undefined]);

  const rows = parse(`

PRIVATE_KEY=

PRIVATE_KEY2=

`);

  assertEquals(rows, [
    ["PRIVATE_KEY", undefined],
    ["PRIVATE_KEY2", undefined],
  ]);
});

Deno.test("handles empty values", () => {
  const [r] = parse(`PRIVATE_KEY=""`);

  assertEquals(r, ["PRIVATE_KEY", ""]);
});

Deno.test("handles multiple key value pairs", () => {
  const rows = parse(`

    # Basic key-value pairs
NODE_ENV=development
# Basic key-value pairs
PORT=3000

`);

  assertEquals(rows, [
    ["NODE_ENV", "development"],
    ["PORT", 3000],
  ]);
});

Deno.test("handles interpolation", () => {
  const rows = parse(`
BASE=example.com
PATH=path
PORT=3000
URL="https://$\{BASE}:$\{PORT}/$\{PATH}"

`);

  assertEquals(rows, [
    ["BASE", "example.com"],
    ["PATH", "path"],
    ["PORT", 3000],
    ["URL", "https://example.com:3000/path"],
  ]);
});

Deno.test("ensures correct interpolation", () => {
  try {
    parse(`
BASE=example.com
PATH=path
URL="https://$\{BASE}:$\{PORT}/$\{PATH}"
`);
    unreachable();
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message === ERROR_MESSAGE.UndefinedInterpolationError("PORT"));
  }
});

const ENV_FILE = `

# Basic key-value pairs
NODE_ENV=development
PORT=3000

# Double-quoted value with spaces and escape sequences
GREETING="Hello, World!"
MULTILINE="first line\nsecond line"

# Single-quoted literal value — no interpolation
REGEX="\d{3}-\d{4}"

# Empty values
OPTIONAL_FLAG=
ALSO_EMPTY=""

# Multiline value with real newlines
PRIVATE_KEY="-----BEGIN EC KEY-----
MHQCAQEEIBkg...
-----END EC KEY-----"

`;

Deno.test("handles whole file", () => {
  const r = parse(ENV_FILE);

  assertEquals(r, [
    ["NODE_ENV", "development"],
    ["PORT", 3000],
    ["GREETING", "Hello, World!"],
    ["MULTILINE", "first line\nsecond line"],
    ["REGEX", "\d{3}-\d{4}"],
    ["OPTIONAL_FLAG", undefined],
    ["ALSO_EMPTY", ""],
    [
      "PRIVATE_KEY",
      `-----BEGIN EC KEY-----
MHQCAQEEIBkg...
-----END EC KEY-----`,
    ],
  ]);
});
