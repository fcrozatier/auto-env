import { validateEnv, ValidationError } from "$/src/validate.ts";
import { unreachable } from "@std/assert/unreachable";
import { assert } from "node:console";
import * as v from "valibot";

Deno.test("validation error", async () => {
  try {
    await validateEnv("string", { schema: v.boolean() });
    unreachable();
  } catch (error) {
    assert(error instanceof ValidationError);
  }
});
