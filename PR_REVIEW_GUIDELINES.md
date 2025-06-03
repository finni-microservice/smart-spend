# PR Review Guidelines

- Ensure that the PR title is in this format: `[ABC-123]: Feature Name` where `ABC-123` is the ticket number and `Feature Name` is the name of the feature. For example, `[MAD-2245]: Add Google Ad Account Connection`.

## API

- Ensure that the new feature is added to the `src/feature-name` folder.
- Ensure that any shared code are added to the `packages/api` folder. Shared codes are stuff like type definitions, validators, etc.

- Ensure that every single endpoint is properly documented with openapi. Including all the possible parameters, responses, etc. Ensure that the response is in the standard `ApiResponseDto<T>` format.

- Ensure that the code is clean and readable.
