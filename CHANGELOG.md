# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.10.10](https://github.com/hikerpig/dagre-layout/compare/v0.10.9...v0.10.10) (2022-08-03)


### Features

* make space for subgraph node.minwidth ([3787c97](https://github.com/hikerpig/dagre-layout/commit/3787c97b61db0c45f8632d7c7260835217041ea7))
* support subgraph padding t and b ([4493992](https://github.com/hikerpig/dagre-layout/commit/449399206d213c7561950b8fd72a6f58642914d7))

### [0.10.9](https://github.com/hikerpig/dagre-layout/compare/v0.10.8...v0.10.9) (2022-05-09)


### Bug Fixes

* output types ([4d4864a](https://github.com/hikerpig/dagre-layout/commit/4d4864ad9529488884f88fd31206ecf476538993))

### [0.10.8](https://github.com/hikerpig/dagre-layout/compare/v0.10.7...v0.10.8) (2022-05-09)


### Features

* improve orthogonal edge by reducing bendpoints under some conditions ([74cca4b](https://github.com/hikerpig/dagre-layout/commit/74cca4babbb0f7796ec008adba40f5a989dc6cd4))

### [0.10.7](https://github.com/hikerpig/dagre-layout/compare/v0.10.6...v0.10.7) (2022-04-16)


### Bug Fixes

* a bug, sometimes 'margint' gets to be added more than once ([a51c4a7](https://github.com/hikerpig/dagre-layout/commit/a51c4a7dc2bf99f1ac40871dcf47d53e4334a2f1))

### [0.10.6](https://github.com/hikerpig/dagre-layout/compare/v0.10.5...v0.10.6) (2022-04-16)

### Optimize

- consider margint and marginb during `doPositionY`

* avoid_label_on_border should also work even when ortho is not enabled ([2c56fad](https://github.com/hikerpig/dagre-layout/commit/2c56fad613cf988e30c12b0d1676225e3e9cd5b9))



### [0.10.5](https://github.com/hikerpig/dagre-layout/compare/v0.10.4...v0.10.5) (2022-04-13)


### Bug Fixes

* a not-so-perfect solution to avoid edge crossing with othogonal edges ([22235f2](https://github.com/hikerpig/dagre-layout/commit/22235f2552414c72de416fb9af43beaf27642d76))

### [0.10.4](https://github.com/hikerpig/dagre-layout/compare/v0.10.3...v0.10.4) (2022-04-10)


### Bug Fixes

* avoid_label_on_border should also work even when ortho is not enabled ([2c56fad](https://github.com/hikerpig/dagre-layout/commit/2c56fad613cf988e30c12b0d1676225e3e9cd5b9))

### [0.10.3](https://github.com/hikerpig/dagre-layout/compare/v0.10.2...v0.10.3) (2022-04-10)


### Bug Fixes

* type export ([23d81aa](https://github.com/hikerpig/dagre-layout/commit/23d81aa0adc74664f0fe43352d3e287a3f227172))

### [0.10.2](https://github.com/hikerpig/dagre-layout/compare/v0.10.1...v0.10.2) (2022-04-10)


### Features

* add option 'avoid_label_on_border' to optimize layout readability ([bf29b6f](https://github.com/hikerpig/dagre-layout/commit/bf29b6f741f8b263476e7fa4fd7e7dbe2d7f8c48))

### [0.10.1](https://github.com/hikerpig/dagre-layout/compare/v0.10.0-alpha.0...v0.10.1) (2022-04-10)


### Features

* add option `splines` and support orthogonal lines ([fc4cb70](https://github.com/hikerpig/dagre-layout/commit/fc4cb701a6a25f0db8e9650e419154e710a292a3))

## [0.10.0](https://github.com/hikerpig/dagre-layout/compare/v0.10.0-alpha.0...v0.10.0) (2022-01-18)

# [0.10.0-alpha.0](https://github.com/hikerpig/dagre-layout/compare/v0.9.0...v0.10.0-alpha.0) (2021-08-15)


### Features

* add margin processing in the `position` phase ([7ed0b22](https://github.com/hikerpig/dagre-layout/commit/7ed0b22ebbf099610707eb51ead5bebcf5d3d753))



# 0.9.0 (2021-07-31)


### Features

* able to set edge between compound node and normal node ([b5f4d80](https://github.com/hikerpig/dagre-layout/commit/b5f4d8002303e26bf725ab58cc1d8874c0b012d0))
* replace lodash ([5be14f1](https://github.com/hikerpig/dagre-layout/commit/5be14f125b788b263bdc2771dc14fa22cdca7bf8))
