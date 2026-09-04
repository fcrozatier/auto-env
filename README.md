# Auto-env

Type-safe environment variables for TypeScript projects, with StandardSchema
validation and good defaults.

**Good defaults**

`Auto-env` lets you fall into
[the pit of success](https://blog.codinghorror.com/falling-into-the-pit-of-success/)
and handles `booleans`, `numbers` and `undefined` correctly. For example this
`.env` file is parsed as you would expect by default

```
DEV=false
RATE_LIMIT=500
OPTIONAL=
PORT=3000
BASE=https://some-domain.com
URL="${BASE}:${PORT}/path"
```

...resulting in the following env object:

```ts
const env = {
  DEV: false,
  RATE_LIMIT: 500,
  OPTIONAL: undefined,
  PORT: 3000,
  BASE: "https://some-domain.com",
  URL: "https://some-domain.com:3000/path",
};
```

In particular:

- `DEV` is parsed as a boolean, not as the string `"false"` (which is truthy)
- `RATE_LIMIT` is parsed as a number, not as the string `"500"` (try `"500"+1`)
- `OPTIONAL` is `undefined`
- `URL` is interpolated

**Type-safety**

`Auto-env` uses StandardSchemas for type-safe env validation:

```ts
import { defineEnv } from "@fcrozatier/auto-env";
import * as v from "valibot";

await defineEnv({
  schema: v.object({
    DEV: v.boolean(),
    RATE_LIMIT: v.pipe(v.number(), v.minValue(500)),
    EMAIL: v.pipe(v.string(), v.email()),
  }),
});
```

**Auto generation**

Create a simple Deno task that updates your `.env.private.ts` and
`.env.public.ts` modules whenever your `.env` file changes. See the
[Usage](#usage) example below.

## Usage

1. Install: `deno add jsr:@fcrozatier/auto-env`

2. Create an `env.ts` module where you call `defineEnv()`.

Under the hood it parses your `.env` file, validates the entries, and returns a
typed object

```ts
// env.ts
import { defineEnv } from "@fcrozatier/auto-env";
import * as v from "valibot";

await defineEnv({
  schema: v.object({
    DEV: v.boolean(),
    RATE_LIMIT: v.pipe(v.number(), v.minValue(500)),
    EMAIL: v.pipe(v.string(), v.email()),
  }),
});
```

## API
