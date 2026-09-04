import { defineEnv } from "$/src/main.ts";
import { assert } from "@std/assert/assert";
import { assertEquals } from "@std/assert/equals";
import { unreachable } from "@std/assert/unreachable";
import * as v from "valibot";

const env = await defineEnv({
  path: "tests/input.env",
  schema: v.object({
    DEV: v.boolean(),
    DEV_STRING: v.string(),
    PORT: v.number(),
    PORT_STRING: v.string(),
    GREETING: v.string(),
    MULTILINE: v.string(),
    PRIVATE_KEY: v.string(),
  }),
});

Deno.test("happy path", () => {
  assertEquals(env, {
    DEV: true,
    DEV_STRING: "true",
    PORT: 3000,
    PORT_STRING: "3000",
    GREETING: "Hello, World!",
    MULTILINE: "first line\\nsecond line",
    PRIVATE_KEY: `
-----BEGIN EC KEY-----
MHQCAQEEIBkg...
-----END EC KEY-----`,
  });
});

Deno.test("validation error", async () => {
  try {
    await defineEnv({
      path: "tests/input.env",
      schema: v.object({
        DEV: v.string(),
      }),
    });

    unreachable();
  } catch (error) {
    assert(error instanceof Error);
    assert(
      error.message ===
        '[auto-env]: Key: "DEV". Invalid type: Expected string but received true',
    );
  }
});

Deno.test("unmatched key", async () => {
  const path = "tests/input.env";
  try {
    await defineEnv({
      path,
      schema: v.object({
        UNMATCHED: v.string(),
      }),
    });
    unreachable();
  } catch (error) {
    assert(error instanceof Error);
    assert(
      error.message ===
        '[auto-env]: Key: "UNMATCHED". Invalid key: Expected "UNMATCHED" but received undefined',
    );
  }
});
