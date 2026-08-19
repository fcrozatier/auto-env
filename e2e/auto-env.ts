import { autoEnv } from "$/src/main.ts";
import * as v from "valibot";

await autoEnv({
  inputPath: "e2e/.env",
  privateOutputPath: "e2e/.env.private.ts",
  publicOutputPath: "e2e/.env.public.ts",
  config: {
    MODE: {
      schema: v.picklist(["dev", "staging", "prod"]),
    },
    RATE_LIMIT: {
      schema: v.pipe(v.number(), v.minValue(500)),
    },
    EMAIL: {
      description: "contact email",
      schema: v.pipe(v.string(), v.email()),
      public: true,
    },
  },
});
