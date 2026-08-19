import {
  alt,
  between,
  many,
  optional,
  type Parser,
  sepBy,
  seq,
} from "@fcrozatier/monarch";
import { literal, regex, token, whitespaces } from "@fcrozatier/monarch/common";
import { ERROR_MESSAGE } from "$/src/errors.ts";

/**
 * The type of an env value
 */
export type EnvValueType = string | number | boolean | undefined;

type ParsedValue =
  | { type: "unquoted"; value: EnvValueType }
  | { type: "double"; value: string }
  | { type: "single"; value: string }
  | { type: "missing"; value: undefined };

const spacesNonLines = regex(/[ \t]*/);

const key = regex(/^[A-Z1-9_]+/).skipTrailing(spacesNonLines);
const equal = literal("=").skipTrailing(spacesNonLines);
const inline = regex(/^[^\n]*/).skipTrailing(whitespaces);

const missingValue: Parser<ParsedValue> = regex(/^(\n+|$)/)
  .skipTrailing(whitespaces)
  .map((_) => ({ type: "missing", value: undefined }));

const unquotedValue: Parser<ParsedValue> = regex(/^[^'"#\s]+/)
  .skipTrailing(whitespaces)
  .map(
    (value) => {
      if (value === "true") return ({ type: "unquoted", value: true });
      if (value === "false") return ({ type: "unquoted", value: false });
      if (value && !Number.isNaN(Number(value))) {
        return ({ type: "unquoted", value: Number(value) });
      }
      return ({ type: "unquoted", value });
    },
  );

const unquotedValueWithSpacesOrHashtag = regex(/^[^'"]*/);

const doubleQuotedValue: Parser<ParsedValue> = between(
  literal('"'),
  unquotedValueWithSpacesOrHashtag,
  literal('"'),
).skipTrailing(whitespaces)
  .map((value) => ({ type: "double", value }));

const value: Parser<ParsedValue> = alt(
  doubleQuotedValue,
  missingValue,
  unquotedValue,
);

export const inlineComment = seq(token("#"), inline).map((_) => "");

const comments = many(inlineComment);

export const line: Parser<[string, ParsedValue]> = seq(key, equal, value)
  .skipTrailing(optional(inlineComment))
  .map(([key, _, value]) => [key, value]);

export const lines: Parser<[string, ParsedValue][]> = between(
  seq(whitespaces, comments),
  sepBy(line, comments),
  seq(whitespaces, comments),
);

const variableExpansion = /\${([^}]+)}/g;

export function parse(content: string) {
  const envs: [string, EnvValueType][] = [];
  const parsedData = lines.parseOrThrow(content);

  for (const [key, parsed] of parsedData) {
    if (parsed.type !== "double") {
      envs.push([key, parsed.value]);
      continue;
    }

    const interpolated = parsed.value.replaceAll(
      variableExpansion,
      (_match, key) => {
        const pair = envs.find(([k]) => k === key);
        if (!pair) {
          throw new Error(ERROR_MESSAGE.UndefinedInterpolationError(key));
        }

        return String(pair[1]);
      },
    );

    envs.push([key, interpolated]);
  }

  return envs;
}

export async function parseEnvFile(
  path: string,
): Promise<[string, EnvValueType][]> {
  const textFile = await Deno.readTextFile(path);
  return parse(textFile);
}
