import { ERROR_MESSAGE } from "$/src/constants.ts";
import type { AutoEnvConfig, EnvVarConfig } from "$/src/main.ts";
import type { EnvValueType } from "$/src/parse.ts";

export class ValidationError {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export async function validateEnv(
  inputValue: EnvValueType,
  config?: EnvVarConfig,
): Promise<unknown> {
  const schema = config?.schema;
  if (!schema) return inputValue;

  const result = await schema["~standard"].validate(inputValue);

  if (result.issues) {
    const message = result.issues[0]?.message ??
      ERROR_MESSAGE.GenericValidationError;
    throw new ValidationError(message);
  }

  return result.value;
}

export async function validateEnvs(
  options: { keyValuePairs: [string, EnvValueType][]; config?: AutoEnvConfig },
) {
  const publicEnvs = new Map();
  const privateEnvs = new Map();

  for (const [key, stringValue] of options.keyValuePairs) {
    const envConfig = options.config?.[key];
    try {
      const value = await validateEnv(stringValue, envConfig);

      (envConfig?.public)
        ? publicEnvs.set(key, value)
        : privateEnvs.set(key, value);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(ERROR_MESSAGE.ValidationErrorOnKey(key), {
          cause: error,
        });
      }

      throw new Error(ERROR_MESSAGE.ParseError, { cause: error });
    }
  }

  return { publicEnvs, privateEnvs };
}