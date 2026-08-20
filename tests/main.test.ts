import { assertEquals } from "@std/assert/equals";
import * as v from "valibot";
import { autoEnv } from "$/src/main.ts";
import { unreachable } from "@std/assert/unreachable";
import { assert } from "@std/assert/assert";
import { ERROR_MESSAGE } from "$/src/constants.ts";

const { publicModuleText, privateModuleText } = await autoEnv({
  inputPath: "tests/input.env",
  privateOutputPath: null,
  publicOutputPath: null,
  config: {
    DEV: { schema: v.boolean() },
    DEV_STRING: { schema: v.string() },
    PORT: { schema: v.number() },
    PORT_STRING: { schema: v.string() },
    GREETING: { public: true, description: "Our welcome message" },
    MULTILINE: { public: true },
    PRIVATE_KEY: { public: false },
  },
});

const outputPublic = await Deno.readTextFile("tests/output.public.ts");
const outputPrivate = await Deno.readTextFile("tests/output.private.ts");

Deno.test("happy path", () => {
  assertEquals(publicModuleText, outputPublic);
  assertEquals(privateModuleText, outputPrivate);
});

Deno.test("validation error", async () => {
  try {
    await autoEnv({
      inputPath: "tests/input.env",
      privateOutputPath: null,
      publicOutputPath: null,
      config: {
        DEV: { schema: v.string() },
      },
    });
    unreachable();
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message === ERROR_MESSAGE.ValidationErrorOnKey("DEV"));
  }
});

Deno.test("unmatched key", async () => {
  const path = "tests/input.env";
  try {
    await autoEnv({
      inputPath: path,
      privateOutputPath: null,
      publicOutputPath: null,
      config: {
        UNMATCHED: { schema: v.string() },
      },
    });
    unreachable();
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message === ERROR_MESSAGE.UnmatchedKey("UNMATCHED", path));
  }
});
