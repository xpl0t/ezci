# ezci

[![Build Status](https://dev.azure.com/sheepr4ider/ezci/_apis/build/status/xpl0t.ezci?branchName=main)](https://dev.azure.com/sheepr4ider/ezci/_build/latest?definitionId=13&branchName=release%2Ftgz)
[![Test results](https://img.shields.io/azure-devops/tests/sheepr4ider/ezci/13?compact_message)](https://dev.azure.com/sheepr4ider/ezci/_build/latest?definitionId=13&branchName=release%2Ftgz)
[![Code coverage](https://img.shields.io/azure-devops/coverage/sheepr4ider/ezci/13)](https://dev.azure.com/sheepr4ider/ezci/_build/latest?definitionId=13&branchName=release%2Ftgz)
[![NPM version](https://img.shields.io/npm/v/ezci.svg)](https://www.npmjs.com/ezci)

## Description

Easy CI is a CLI to trigger pipelines for rapid continuous integration

## Installation

### Install globally

```
$ npm install -g ezci
```

### Install for project

Useful for the integration in [package.json scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts)

```
$ npm install --save-dev ezci
```

## Usage

```
$ ezci run
```
```
$ ezci run --help
```
```
$ ezci run --branch release/test --verbose
```
```
$ ezci run --branch-pattern pipeline/
```

**Description:**

Run a pipeline with push trigger.

**Procedure:**

Queries all available release branches by checking if the name starts with the branch pattern (**-p**/**--branch-pattern**, default ist **release/**).

List all release pipelines and allows the user to select one, if no specific branch (**-b**/**--branch**) was specified.

Runs the following exemplary git commands:

* git checkout *release-branch*
* git reset --hard *initial-branch*
* git push -f
* git checkout *initial-branch*

Through those commands, the release branch gets completly overwriten by the initial branch (which is the current branch, when you run the command) and than gets forced pushed to the remote, which activates the push trigger set for this branch.

**Arguments:**

`--branch | -b` Specifies the release branch to use.

`--branch-pattern | -p` Specifies the pattern the release branches start with. (Default: **release/**)
