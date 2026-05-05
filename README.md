# BMYC - Bump Me if You Can

A powerful CLI tool to automatically manage and update static assets from various CDN providers (GitHub, CDNjs, jsDelivr, and Unpkg) in your project.

## Overview

**BMYC** (Bump Me if You Can) is a Python-based command-line tool designed to simplify the management of external JavaScript, CSS, and other static assets. Instead of manually tracking versions and updating file paths, BMYC automates the process by:

- Fetching the latest versions from multiple CDN providers
- Downloading and saving updated assets to your project
- Managing asset versions with version pinning support
- Validating your asset configuration
- Generating summary reports of updates

## Features

- 🔄 **Multi-Provider Support**: Seamlessly work with GitHub, CDNjs, jsDelivr (npm), and Unpkg
- 🔒 **Version Pinning**: Lock assets to specific versions with the `hold` flag
- ⚙️ **Flexible Configuration**: Define assets in JSON or YAML format
- 🚀 **Async Processing**: Efficiently fetch and process multiple assets concurrently
- 📊 **Detailed Reporting**: Generate summary reports of all updates
- 🔐 **GitHub Token Support**: Securely authenticate with GitHub for private repositories
- 🔧 **Force Updates**: Override version locks when needed
- 📝 **Configuration Validation**: Automatic validation of your configuration files using Pydantic

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/jgazeau/bmyc.git
cd bmyc

# Install dependencies using Poetry
poetry install

# Build and install
poetry build
pip install dist/bmyc-*.whl
```

### Via Pip (when published)

```bash
pip install bmyc
```

## Quick Start

### 1. Create a Configuration File

Create a `.bmycconfig.json` or `.bmycconfig.yaml` file in your project root:

```json
{
  "jquery": {
    "library": {
      "local_path": "assets/js/jquery.min.js",
      "hold": false,
      "cdnjs": {
        "library": "jquery",
        "file_path": "jquery.min.js"
      }
    }
  },
  "bootstrap": {
    "css": {
      "local_path": "assets/css/bootstrap.min.css",
      "jsdelivr": {
        "cdn": "npm",
        "package": "bootstrap",
        "file_path": "dist/css/bootstrap.min.css"
      }
    }
  }
}
```

### 2. Run BMYC

```bash
bmyc --configuration .bmycconfig.json
```

BMYC will:

- Fetch the latest version of each asset from its provider
- Download the files to their specified local paths
- Update the configuration file with the new versions
- Generate a summary report

## Configuration Format

### Configuration Structure

Your configuration file is organized in a hierarchical structure:

```
Configuration
└── Package (e.g., "jquery", "bootstrap")
    └── Asset (e.g., "library", "css")
        ├── local_path: Where to save the file
        ├── hold: Lock version (optional, default: false)
        ├── current_version: Current version (required if hold=true)
        └── provider: Asset source
```

### Asset Configuration

Each asset requires:

- **`local_path`** (required): Relative or absolute path where the asset will be saved
- **`hold`** (optional): Boolean flag to lock the asset to a specific version (default: `false`)
- **`current_version`** (required if `hold=true`): The version to pin to
- **`provider`** (required): Provider configuration (see below)

### Supported Providers

#### CDNjs

For assets hosted on CDNjs:

```json
{
  "package_name": {
    "asset_name": {
      "local_path": "assets/lib.min.js",
      "cdnjs": {
        "library": "library-name",
        "file_path": "relative/path/to/file.min.js"
      }
    }
  }
}
```

**Provider Fields:**

- `library`: The library name on CDNjs
- `file_path`: The path to the specific file within the library

#### jsDelivr

For npm packages via jsDelivr:

```json
{
  "package_name": {
    "asset_name": {
      "local_path": "assets/lib.min.js",
      "jsdelivr": {
        "cdn": "npm",
        "package": "package-name",
        "file_path": "dist/file.min.js"
      }
    }
  }
}
```

**Provider Fields:**

- `cdn`: The CDN type (currently supports `"npm"`)
- `package`: The npm package name
- `file_path`: The path to the specific file within the package

#### GitHub

For files hosted in GitHub repositories:

```json
{
  "package_name": {
    "asset_name": {
      "local_path": "assets/lib.min.js",
      "github": {
        "owner": "repository-owner",
        "repository": "repository-name",
        "file_path": "path/to/file.min.js"
      }
    }
  }
}
```

**Provider Fields:**

- `owner`: GitHub repository owner username
- `repository`: GitHub repository name
- `file_path`: Path to the file within the repository

**Note:** For GitHub, you may need to provide a GitHub token via the `--github-token` option for authentication.

#### Unpkg

For npm packages via Unpkg:

```json
{
  "package_name": {
    "asset_name": {
      "local_path": "assets/lib.min.js",
      "unpkg": {
        "library": "package-name",
        "file_path": "dist/file.min.js"
      }
    }
  }
}
```

**Provider Fields:**

- `library`: The npm package name
- `file_path`: The path to the specific file within the package

### Version Pinning

Lock an asset to a specific version:

```json
{
  "package_name": {
    "critical_asset": {
      "local_path": "assets/critical.min.js",
      "current_version": "2.1.0",
      "hold": true,
      "cdnjs": {
        "library": "some-library",
        "file_path": "some-library.min.js"
      }
    }
  }
}
```

When `hold` is `true`, BMYC will skip updating this asset unless forced with the `--force` flag.

## Command Line Interface

### Basic Usage

```bash
bmyc [OPTIONS]
```

### Options

#### `-c, --configuration PATH`

Path to the configuration file (JSON or YAML).

- **Type**: File path
- **Default**: `.bmycconfig.json`
- **Required**: Yes
- **Example**: `bmyc --configuration config.yaml`

#### `-s, --summary PATH`

Path where the summary report will be saved.

- **Type**: File path
- **Default**: `bmyc-summary.md`
- **Example**: `bmyc --summary update-report.md`

#### `-f, --force`

Force update of all assets, including those marked with `hold: true`.

- **Type**: Flag
- **Default**: Off
- **Example**: `bmyc --force`

#### `-i, --insecure`

Allow insecure TLS connections (not recommended for production).

- **Type**: Flag
- **Default**: Off
- **Example**: `bmyc --insecure`

#### `--github-token TOKEN`

GitHub API token for authenticating with GitHub when fetching assets.

- **Type**: String
- **Environment Variable**: `BMYC_GITHUB_TOKEN`
- **Example**: `bmyc --github-token ghp_xxxxxxxxxxxx`

#### `-v, --verbose`

Increase verbosity level (can be used multiple times: `-v`, `-vv`, `-vvv`).

- **Type**: Flag (repeatable)
- **Default**: Level 2 (INFO)
- **Levels**:
  - No flag: ERROR
  - `-v`: WARNING
  - `-vv`: INFO
  - `-vvv`: DEBUG
- **Example**: `bmyc -vv` for INFO level logs

#### `-h, --help`

Display help message.

## CLI Examples

### Basic update

```bash
bmyc --configuration .bmycconfig.json
```

### Update with a custom summary file

```bash
bmyc --configuration assets-config.json --summary updates.md
```

### Force update all assets (including pinned versions)

```bash
bmyc --force --configuration .bmycconfig.json
```

### Update with GitHub token via environment variable

```bash
export BMYC_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
bmyc --configuration .bmycconfig.json
```

### Update with GitHub token via CLI

```bash
bmyc --configuration .bmycconfig.json --github-token ghp_xxxxxxxxxxxx
```

### Debug mode with maximum verbosity

```bash
bmyc --configuration .bmycconfig.json -vvv
```

### Update without certificate verification (use with caution)

```bash
bmyc --configuration .bmycconfig.json --insecure
```

## Workflow Example

Here's a complete example of using BMYC in a web project:

### Step 1: Create Configuration

Create `.bmycconfig.json`:

```json
{
  "jquery": {
    "library": {
      "local_path": "public/vendor/jquery.min.js",
      "cdnjs": {
        "library": "jquery",
        "file_path": "jquery.min.js"
      }
    }
  },
  "bootstrap": {
    "css": {
      "local_path": "public/vendor/bootstrap.min.css",
      "hold": true,
      "current_version": "5.1.3",
      "jsdelivr": {
        "cdn": "npm",
        "package": "bootstrap",
        "file_path": "dist/css/bootstrap.min.css"
      }
    },
    "js": {
      "local_path": "public/vendor/bootstrap.min.js",
      "hold": true,
      "current_version": "5.1.3",
      "jsdelivr": {
        "cdn": "npm",
        "package": "bootstrap",
        "file_path": "dist/js/bootstrap.min.js"
      }
    }
  },
  "popper": {
    "library": {
      "local_path": "public/vendor/popper.min.js",
      "unpkg": {
        "library": "@popperjs/core",
        "file_path": "dist/umd/popper.min.js"
      }
    }
  },
  "highlight": {
    "css": {
      "local_path": "public/vendor/highlight.min.css",
      "cdnjs": {
        "library": "highlight.js",
        "file_path": "styles/atom-one-dark.min.css"
      }
    },
    "js": {
      "local_path": "public/vendor/highlight.min.js",
      "cdnjs": {
        "library": "highlight.js",
        "file_path": "highlight.min.js"
      }
    }
  }
}
```

### Step 2: Run BMYC

```bash
bmyc --configuration .bmycconfig.json --summary bmyc-update.md
```

### Step 3: Review Summary

Check `bmyc-update.md` to see what was updated:

```markdown
# BMYC Summary Report

## Bootstrap

- **css**: Updated from 5.1.3 → 5.3.0 (held)
- **js**: Updated from 5.1.3 → 5.3.0 (held)

## jQuery

- **library**: Updated from 3.6.0 → 3.7.1

## Popper

- **library**: Updated from 2.11.8 → 2.11.8

## Highlight

- **css**: Updated from 11.8.0 → 11.9.0
- **js**: Updated from 11.8.0 → 11.9.0
```

### Step 4: Force Update Pinned Assets

```bash
bmyc --force --configuration .bmycconfig.json
```

## Summary Report

After running BMYC, a summary report is generated (default: `bmyc-summary.md`) containing:

- List of all packages processed
- Assets within each package
- Version updates (previous → new)
- Status of each asset (updated, held, error)
- Timestamps and processing details

## Configuration Validation

BMYC validates your configuration file and provides detailed error messages for:

- Invalid file paths
- Missing required provider fields
- Invalid provider types
- Duplicate local paths
- Missing `current_version` when `hold: true`
- Malformed JSON/YAML

## Development

### Setup Development Environment

```bash
# Install Poetry
pip install poetry

# Clone and navigate to project
git clone https://github.com/jgazeau/bmyc.git
cd bmyc

# Install dependencies
poetry install
```

### Available Development Tasks

```bash
# Run tests with coverage
poetry run poe test

# Run tests only
poetry run poe test:coverage

# Generate HTML coverage report
poetry run poe test:coverage-html

# Lint and format code
poetry run poe lint

# Format with Black
poetry run poe format:black

# Check with Black
poetry run poe lint:black

# Sort imports with isort
poetry run poe lint:isort

# Check with flake8
poetry run poe lint:flake8
```

### Running Locally

```bash
poetry run bmyc --help
poetry run bmyc --configuration tests/resources/model/config-valid.json
```

### Project Structure

```
bmyc/
├── src/bmyc/                    # Main package
│   ├── __init__.py
│   ├── cli.py                   # CLI entry point
│   ├── cli_context.py           # CLI context management
│   ├── processor.py             # Main processing logic
│   ├── results_handler.py       # Result handling and reporting
│   ├── commons/                 # Common utilities
│   │   ├── bmyc_error.py        # Custom exceptions
│   │   ├── common_constants.py  # Constants
│   │   ├── helpers.py           # Helper functions
│   │   ├── json.py              # JSON utilities
│   │   ├── logging.py           # Logging configuration
│   │   ├── singleton.py         # Singleton pattern
│   │   └── yaml.py              # YAML utilities
│   └── model/                   # Data models
│       ├── asset.py             # Asset model
│       ├── asset_status_enum.py # Asset status enumeration
│       ├── bmyc_configuration.py # Configuration model
│       ├── package.py           # Package model
│       └── providers/           # Provider implementations
│           ├── provider.py      # Base provider class
│           ├── cdnjs.py         # CDNjs provider
│           ├── github.py        # GitHub provider
│           ├── jsdelivr.py      # jsDelivr provider
│           └── unpkg.py         # Unpkg provider
├── tests/                       # Test suite
│   ├── test_processor.py
│   ├── test_results_handler.py
│   ├── resources/               # Test fixtures and config examples
│   └── test_commons/
│       ├── test_helpers.py
│       ├── test_json.py
│       ├── test_logging.py
│       └── test_yaml.py
├── pyproject.toml              # Project configuration
├── poetry.lock                 # Locked dependencies
└── README.md                   # This file
```

### Running Tests

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=src/bmyc tests/

# Run specific test file
poetry run pytest tests/test_processor.py

# Run with verbose output
poetry run pytest -v
```

## Error Handling

BMYC provides clear error messages for common issues:

### Configuration Errors

```
Error: Configuration validation failed
  - Invalid provider type: 'npmjs' (expected: cdnjs, github, jsdelivr, unpkg)
  - Missing required field: 'library' in cdnjs provider
  - Duplicate local_path: 'assets/lib.min.js'
```

### Network Errors

```
Error: Failed to fetch latest version for jquery from Cdnjs
  - Connection timeout while reaching api.cdnjs.com
  - Ensure your internet connection is stable
```

### Authentication Errors

```
Error: GitHub API authentication failed
  - Invalid or expired GitHub token
  - Set BMYC_GITHUB_TOKEN environment variable or use --github-token option
```

## Troubleshooting

### GitHub Token Issues

If you get authentication errors when fetching from GitHub:

1. Generate a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Create a new token with `repo` scope
   - Copy the token

2. Provide the token to BMYC:
   ```bash
   export BMYC_GITHUB_TOKEN=your_token_here
   bmyc --configuration .bmycconfig.json
   ```

### SSL/TLS Errors

If you encounter SSL certificate errors:

```bash
# Use the --insecure flag (not recommended for production)
bmyc --insecure --configuration .bmycconfig.json
```

### File Path Issues

Ensure all `local_path` values are:

- Relative to your project root, OR
- Absolute paths
- Parent directories exist or will be created by BMYC

### Slow Updates

For better performance with many assets:

- Ensure your internet connection is stable
- Check provider API rate limits
- Use verbose mode to identify slow operations: `bmyc -vv`

## Performance Considerations

- **Concurrent Processing**: BMYC processes multiple assets concurrently for efficiency
- **Caching**: No caching is implemented; each run fetches fresh data
- **Network**: Update speed depends primarily on CDN provider response times
- **Disk I/O**: Files are saved with streaming to minimize memory usage

## Security

- BMYC validates all configuration inputs
- GitHub tokens should never be committed to version control
- Use environment variables or secure secrets management for tokens
- TLS verification is enabled by default

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Jordan Gazeau** - [GitHub](https://github.com/jgazeau)

## Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/jgazeau/bmyc/issues).

## Changelog

### Version 1.1.0

Initial release with support for:

- CDNjs provider
- GitHub provider
- jsDelivr provider
- Unpkg provider
- YAML and JSON configuration
- Version pinning
- Summary reporting
