# Contributing to BMYC

Thank you for your interest in contributing to BMYC! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional. We're committed to providing a welcoming and inspiring community for all.

## Getting Started

### Prerequisites

- Python 3.14 or higher
- Poetry (for dependency management)
- Git

### Setup Development Environment

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR-USERNAME/bmyc.git
   cd bmyc
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/jgazeau/bmyc.git
   ```

4. **Install Poetry**

   ```bash
   pip install poetry
   ```

5. **Install dependencies**

   ```bash
   poetry install
   ```

6. **Activate the virtual environment**
   ```bash
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

## Development Workflow

### Creating a Feature Branch

```bash
# Update main branch
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation
- `refactor/description` - for code refactoring

### Making Changes

1. **Write your code** following the code standards (see below)
2. **Run tests locally** to ensure nothing breaks:
   ```bash
   poetry run pytest
   ```
3. **Run linting** to check code quality:
   ```bash
   poetry run poe lint
   ```

### Code Standards

- **PEP 8**: Follow Python Enhancement Proposal 8 conventions
- **Type Hints**: Use type annotations for all functions and variables
- **Docstrings**: Include docstrings for modules, classes, and public methods
- **Testing**: Write unit tests for new features (minimum 80% coverage)
- **Imports**: Sort imports with `isort`
- **Formatting**: Format code with `black`

### Available Development Tasks

All tasks are managed via poethepoet (poe). Available commands:

```bash
# Run all linting checks
poetry run poe lint

# Format code with Black
poetry run poe format:black

# Check formatting with Black (without modifying)
poetry run poe lint:black

# Sort imports with isort
poetry run poe lint:isort

# Check with flake8
poetry run poe lint:flake8

# Run tests
poetry run pytest

# Run tests with coverage report
poetry run poe test

# Run tests and generate HTML coverage report
poetry run poe test:coverage-html
```

### Testing

- Write tests for all new functionality
- Place tests in the appropriate directory under `tests/`
- Follow the naming convention `test_*.py`
- Aim for at least 80% code coverage

Example test structure:

```python
import pytest
from bmyc.module import function

class TestFunction:
    def test_expected_behavior(self):
        result = function(args)
        assert result == expected_value

    def test_edge_case(self):
        with pytest.raises(ExpectedException):
            function(invalid_args)
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

# Run with HTML coverage report
poetry run poe test:coverage-html
```

## Code Quality Checklist

Before submitting a PR, ensure:

- [ ] Code follows PEP 8 standards
- [ ] All functions have type hints
- [ ] All public functions/classes have docstrings
- [ ] All tests pass: `poetry run pytest`
- [ ] Linting passes: `poetry run poe lint`
- [ ] Coverage is at least 80%
- [ ] No hardcoded values or credentials
- [ ] Commit messages are clear and descriptive

## Commit Messages

Write clear, descriptive commit messages:

```
type(scope): description

- Detailed explanation if needed
- Reference issues with #123

Examples:
feat(processor): add async asset processing
fix(cli): correct argument parsing for github-token
docs(readme): update installation instructions
refactor(commons): simplify error handling
test(provider): add edge case tests for cdnjs
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build, dependencies, etc.
- `ci`: CI/CD changes

## Submitting a Pull Request

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub
   - Use a clear title describing your changes
   - Reference related issues (#123)
   - Describe what changes you made and why
   - Include any relevant test results or screenshots

3. **PR Description Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   Describe testing performed

   ## Checklist

   - [ ] Tests pass
   - [ ] Linting passes
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

4. **Address Review Feedback**
   - Make requested changes
   - Commit with meaningful messages
   - Re-request review when ready

## Project Structure

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
├── .github/                     # GitHub configuration
│   └── workflows/               # CI/CD workflows
├── pyproject.toml              # Project configuration
├── poetry.lock                 # Locked dependencies
└── README.md                   # Project documentation
```

## Testing New Providers

If you're adding a new CDN provider:

1. Create a new provider class in `src/bmyc/model/providers/`
2. Inherit from `BaseProvider`
3. Implement required methods: `fetch_latest_version()` and `get_file_url()`
4. Add comprehensive tests in `tests/test_model/`
5. Update configuration documentation in README

Example provider structure:

```python
from bmyc.model.providers.provider import BaseProvider

class MyProvider(BaseProvider):
    """Provider for MyService."""

    def fetch_latest_version(self) -> str:
        """Fetch latest version from MyService API."""
        pass

    def get_file_url(self, version: str) -> str:
        """Get file URL for specific version."""
        pass
```

## Reporting Issues

Found a bug or have a feature request?

1. Check if issue already exists
2. Provide:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Python version and OS
   - Configuration example (if relevant)

## Getting Help

- Check the [README](README.md) documentation
- Review existing issues and PRs
- Open a discussion for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to BMYC! 🎉
