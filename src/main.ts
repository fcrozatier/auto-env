import { ERROR_MESSAGE, PREFIX } from "$/src/constants.ts";
import { parse } from "$/src/parse.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * {@link defineEnv} global options
 */
export type Options<S extends StandardSchemaV1> = {
  /**
   * The path to your .env file
   *
   * @default ".env"
   */
  path?: string;
  /**
   * Standard Schema object
   *
   * @example
   * ```ts
   * import * as v from "valibot";
   *
   * await defineEnv({
   *    schema: v.object({
   *      EMAIL: v.pipe(v.string(), v.email()),
   *    }),
   * });
   *
   * ```
   */
  schema: S;
};

/**
 * Reads and validates your environment variables.
 *
 * Outputs TypeScript modules for type-safe env imports
 */
export async function defineEnv<S extends StandardSchemaV1>(
  options: Options<S>,
): Promise<StandardSchemaV1.InferOutput<S>> {
  const schema = options.schema;
  const path = options.path ?? ".env";

  const textFile = await Deno.readTextFile(path);
  const envs = Object.fromEntries(parse(textFile));
  const result = await schema["~standard"].validate(envs);

  if (result.issues) {
    const issue = result.issues[0];
    let message = ERROR_MESSAGE.GenericValidationError;
    if (issue) {
      // @ts-ignore optional chaining
      const key = issue.path?.[0]?.key;
      message = PREFIX + `Key: "${key}". ${issue.message}`;
    }
    throw new Error(message);
  }

  return result.value;
}
