# Markopolo AI

The monorepo for the Markopolo AI app.

## Running the project

Run the following command:

```bash
pnpm install
```

then,

```bash
pnpm dev
```

> [!WARNING]
> If you are trying to run the `api` project, you need to run `docker compose up -d` first.

To run specific apps, use the following commands:

1. Client: `pnpm client:dev`
2. API: `pnpm api:dev`

After running the API, you can access:

1. Client: [http://localhost:5173/](http://localhost:5173/)
2. API: [http://localhost:3000/](http://localhost:3000/)
3. API Docs: [http://localhost:3000/api](http://localhost:3000/docs)
4. Swagger Stats: [http://localhost:3000/stats](http://localhost:3000/stats)

## Read specific app related docs

- [Client](apps/client/README.md)
- [API](apps/api/README.md)

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

    .
    ├── apps
    │   ├── api                       # NestJS app (https://nestjs.com).
    │   └── client                    # React.js app
    └── packages
        ├── @repo/api                 # Shared `NestJS` resources.
        ├── @repo/eslint-config       # `eslint` configurations (includes `prettier`)
        ├── @repo/jest-config         # `jest` configurations
        ├── @repo/typescript-config   # `tsconfig.json`s used throughout the monorepo

Each package and application are 100% [TypeScript](https://www.typescriptlang.org/) safe.

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
