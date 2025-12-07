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
# TBD after publishing to PyPI
pip install bmyc
```

### Usage

```
Usage: bmyc [OPTIONS]

  Tool to bump assets based on a configuration file

Options:
  -c, --config PATH               Path of the configuration file. [default: .bmycconfig.json]
  -f, --force                     Force update of configuration.
  -s, --summary-pr PATH           Path of the generated markdown summary used to describe a Pull Request.
  --install-completion            Install completion for the current shell.
  --show-completion               Show completion for the current shell, to copy it or customize the installation.
  --help                          Show this message and exit.
```

### Examples
```
bmyc --force                         # Force asset's update
bmyc --config "./myconfig.json"      # Use specific configuration file
bmyc --summary-pr "./summary-pr.md"  # Generate markdown summary results to describe a Pull Request
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
    "package": "package1",
    "hold": false,
    "name": "asset1",
    "localPath": "path/asset1.min.js",
    "assetManager": {
      "name": "cdnjs",
      "library": "library",
      "fileName": "asset1.min.js"
    },
    "currentVersion": "0.0.1"
  },
  {
    "package": "package2",
    "hold": false,
    "name": "asset2",
    "localPath": "./path/asset2.min.js",
    "assetManager": {
      "name": "github",
      "owner": "owner",
      "repository": "repository",
      "filePath": "dir/asset2.min.js"
    }
  },
  {
    "package": "package3",
    "hold": false,
    "name": "asset3",
    "localPath": "./path/asset3.min.js",
    "assetManager": {
      "name": "unpkg",
      "library": "asset3",
      "filePath": "dist/asset3.min.js"
    }
  },
  {
    "package": "package4",
    "hold": false,
    "name": "asset4",
    "localPath": "./path/asset4.min.js",
    "assetManager": {
      "name": "jsdelivr",
      "cdn": "npm",
      "package": "asset4",
      "filePath": "dist/asset4.min.js"
    }
  }
]
```

## Upcoming features

* YAML support for configuration file
* more assetManagers
* interactive help to build configuration file
