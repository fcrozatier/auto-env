import { assertEquals } from "@std/assert/equals";
import * as v from "valibot";
import { autoEnv } from "../main.ts";

const { publicModuleText, privateModuleText } = await autoEnv({
  inputPath: "tests/input.env",
  privateOutputPath: null,
  publicOutputPath: null,
  config: {
    DEV: { schema: v.boolean() },
    DEV_STRING: { schema: v.string() },
    PORT: { schema: v.number() },
    PORT_STRING: { schema: v.string() },
    GREETING: { public: true },
    MULTILINE: { public: true },
    PRIVATE_KEY: { public: false },
  },
});

const outputPublic = await Deno.readTextFile("tests/output.public.ts");
const outputPrivate = await Deno.readTextFile("tests/output.private.ts");

Deno.test("works", () => {
  assertEquals(publicModuleText, outputPublic);
  assertEquals(privateModuleText, outputPrivate);
});
