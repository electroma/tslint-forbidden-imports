## tslint-forbidden-imports

This rule is useful in larger code bases to control dependencies between project modules.
For example project code has the directory layout like:
```text
src/
    client/
    server/
    common/
``` 

Imports between following directories should be forbidden:
* `client` -> `server`
* `server` -> `client`
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

`yarn install tslint-forbidden-imports`


## Configuration

* Add `node_modules/tslint-forbidden-imports` to `rulesDirectory` parameter of your `tslint.json`.
* Enable rule `forbidden-imports` and pass mapping `file pattern` -> `[fordidden import patterns...]` 

## Development

To run tests, just run `yarn test`.

Project tests are based on [test helper](https://github.com/Microsoft/tslint-microsoft-contrib/blob/master/src/tests/TestHelper.ts) from [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib).

## References

* [TSLint Custom Rules Development](https://palantir.github.io/tslint/develop/custom-rules/)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib) has a ton of well-tested rule examples
