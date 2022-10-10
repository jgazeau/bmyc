# Bump Me if You Can (bmyc)

## Context

This tool aim to **bump assets to their latest version**. By asset, understand a file containing ... whatever needed.  
Bacause sometimes projects needs lot of assets located at several different places, it might be hard to maintain and keep these assets up-to-date.
In that case, Bmyc should just fit your needs.

## How it works?

* Bmyc uses a configuration file (by default *.bmycconfig.json*) to store assets it needs to manage.
* Bmyc will try to bump all assets to their latest version and update the configuration file accordingly (unless the latest version is already specified in the configuration file or the force option is used)
* To bump assets, Bmyc is using *asset managers*, named from where assets needs to be retrieved. For now the following asset managers are availables:
    * [github](https://github.com/) (Sources from repository)
    * [cdnjs](https://cdnjs.com/)
    * [unpkg](https://unpkg.com/)
    * [jsdelivr](https://www.jsdelivr.com/)

## How to use it?

### Installation

```sh
npm install bmyc
```

### Usage

```
●       _____
●      | ___ \
●      | |_/ /_ __ ___  _   _  ___
●      | ___ \ '_ ` _ \| | | |/ __|
●      | |_/ / | | | | | |_| | (__
●      |____/|_| |_| |_|\__, |\___|
●                       |___/

Usage: bmyc [options]

Common options:
  -f, --force                    Force update of configuration            [boolean] [default: false]
  -c, --config                   Path of the configuration file        [default: ".bmycconfig.json"]
  -s, --summaryPR, --summary-pr  Path of the generated markdown summary used to describe a Pull
                                 Request

Other Options:
      --debug    Turn on debug logging                                    [boolean] [default: false]
  -v, --version  Show version number                                                       [boolean]
  -h, --help     Show help                                                                 [boolean]

Examples:
  bmyc --force                         Force asset's update
  bmyc --config "./myconfig.json"      Use specific configuration file
  bmyc --summary-pr "./summary-pr.md"  Generate markdown summary results to describe a Pull Request

Package managers available:
  - cdnjs
  - github
  - unpkg
  - jsdelivr

Additional information:
  GitHub: https://github.com/jgazeau/bmyc.git
  Documentation: https://github.com/jgazeau/bmyc#readme
  Issues: https://github.com/jgazeau/bmyc/issues
```

### How to hold a version?

To hold a version of an asset, and therefore don't update it during the update process, set the `hold` parameter for the specific asset to `true`:
```json
{
  ...
  "name": "asset1",
  "hold": true,
  ...
}
```

### How to generate a summary for PR creation?

It is possible to generate a summary containing a title and a description for creating a PR.

The generated file has the following characteristics:
* markdown format
* title on first line separated from the description by a blank line
* description table containing updated assets
* not generated when no assets updated

# Examples

```json
[
  {
    "package": "asset1Package",
    "name": "asset1",
    "hold": false,
    "localPath": "path/asset1.min.js",
    "assetManager": {
      "name": "cdnjs",
      "library": "library",
      "fileName": "asset1.min.js"
    },
    "currentVersion": "0.0.1"
  },
  {
    "package": "asset2Package",
    "name": "asset2",
    "hold": false,
    "localPath": "./path/asset2.min.js",
    "assetManager": {
      "name": "github",
      "owner": "owner",
      "repository": "repository",
      "filePath": "dir/asset2.min.js"
    }
  }
]
```

## Upcoming features

* YAML support for configuration file
* more assetManagers
* interactive help to build configuration file
