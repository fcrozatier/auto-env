export const PREFIX = "[auto-env]: ";

export const ERROR_MESSAGE = {
  GenericValidationError: PREFIX + "Validation error",
  ValidationErrorOnKey: (key: string) =>
    PREFIX + `Validation error on key "${key}"`,
  ParseError: PREFIX + `Parse error`,
  UndefinedInterpolationError: (key: string) =>
    PREFIX + `Can't interpolate undefined key "${key}"`,
  UnmatchedKey: (key: string, path: string) =>
    PREFIX +
    `Key "${key}" doesn't match any variable in file "${path}". Is this a typo?`,
};
