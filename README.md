# dagre-layout - Graph layout for JavaScript

[![Build Status](https://circleci.com/gh/hikerpig/dagre-layout.svg?style=shield)](https://circleci.com/gh/hikerpig/dagre-layout)
[![codecov](https://codecov.io/gh/hikerpig/dagre-layout/branch/master/graph/badge.svg?token=BA06M96QIR)](https://codecov.io/gh/hikerpig/dagre-layout)

This project is an out-of-box replacement for [dagre](https://github.com/dagrejs/dagre).

Based on the original [dagre](https://github.com/dagrejs/dagre) and Tyler's [dagre-layout](https://github.com/tylingsoft/dagre-layout).

Dagre is a JavaScript library that makes it easy to lay out directed graphs on the client-side.

For more details, including examples and configuration options, please see the [wiki](https://github.com/dagrejs/dagre/wiki).


## Changes compared to dagrejs/dagre

- Upgrade all the dependencies (loadash 3 => 4)
- Yarn instead of NPM
- Get rid of PhantomJS
- Written in Typescript
- Use rollup instead of browserify
- Use Jest for testing
- Add test coverage report
- Remove Bower support
- Use 0 instead of `Number.NEGATIVE_INFINITY`
- Git ignore auto-generated code
- Others mentioned in the CHANGELOG.md


## Setup

```
yarn install
```


## Build

```
yarn build
```


## Test

```
yarn test
```


## License

dagre-layout is licensed under the terms of the MIT License. See the LICENSE file for details.
