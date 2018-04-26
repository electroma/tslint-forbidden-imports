[![npm version](https://badge.fury.io/js/tslint-forbidden-imports.svg)](https://badge.fury.io/js/tslint-microsoft-contrib)
[![Build Status](https://travis-ci.org/electroma/tslint-forbidden-imports.svg?branch=master)](https://travis-ci.org/electroma/tslint-forbidden-imports)

## tslint-forbidden-imports

This rule is useful in larger code bases to control dependencies between project modules.
Rule allows to specify source file patterns and list of path patterns which should not be allowed.

## Example use case

For example project code has the directory layout like:
```text
src/
    client/
    server/
    common/
``` 

Directories `client`, `server` and `common` represent code scopes:
* `client` - application UI
* `server` - server-side logic
* `common` - shared constants and interfaces 

In this setup imports between following directories should not be allowed:
* `client` -> `server` (something like `import server from '../../server/myAPIServer'`)
* `server` -> `client` (something like `import Crux from '../../client/components/Crux'`)
* `common` -> `client`
* `common` -> `server`

It may be implemented by adding the following rule configuration:
```json
{
  "forbidden-imports": [true, {
          "client/**": ["server/**"],
          "server/**": ["client/**"],
          "common/**": ["client/**", "server/**"]
  }]
}
```

## Installation

`yarn install -d tslint-forbidden-imports`

## Configuration

1. Add `node_modules/tslint-forbidden-imports` to `rulesDirectory` parameter of your `tslint.json`.
2. Enable rule `forbidden-imports` and pass mapping `"file pattern"` -> `["fordidden import patterns"...]` 

The pattern syntax may use any features supported by [micromatch](https://github.com/micromatch/micromatch#matching-features).

Supported import pattern types:
* Node package (i.e. `lodash` or `ui-*`)
* GLOB file path relative to project root (i.e. `src/client/**` or `plugins/*/src/ui/**`) 

## Advanced configuration: placeholders

Library has support for placeholder replacement.
This rule will not allow imports between child directories of `plugins` directory
```js
{
    'plugins/*/src/**': ['plugins/!(%0%)/**']
}
```

## Development

To run tests, just run `yarn test`.

Project tests are based on [test helper](https://github.com/Microsoft/tslint-microsoft-contrib/blob/master/src/tests/TestHelper.ts) from [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib).

## References

* [TSLint Custom Rules Development](https://palantir.github.io/tslint/develop/custom-rules/)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib) has a ton of well-tested rule examples
