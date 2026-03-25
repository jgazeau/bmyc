from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class CliContext:
    force: bool
    insecure: bool
    configuration: Path
    summary: Path | None
    github_token: Optional[str]
