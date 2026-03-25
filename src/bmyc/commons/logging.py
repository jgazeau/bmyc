import logging

from bmyc.commons.common_constants import MAX_TTY_LENGTH


def log_title(title: str, char_rule="-"):
    """Log a title (centered text between horizontal rules).

    Parameters
    ----------
    title : str
        Title text.
    char_rule : str, optional
        Char used in the horizontal rules, by default "-".
    """
    log_horizontal_rule(char_rule)
    logging.info(f" {title} ".center(MAX_TTY_LENGTH, char_rule))
    log_horizontal_rule(char_rule)


def log_horizontal_rule(char_rule="-"):
    """Log a horizontal rule.

    Parameters
    ----------
    char_rule : str, optional
        Char used in the horizontal rules, by default "-".
    """
    logging.info(char_rule * MAX_TTY_LENGTH)


def log_header():
    """Log the CLI header."""
    log_horizontal_rule("_")
    logging.info("       _____")
    logging.info("      | ___ \\")
    logging.info("      | |_/ /_ __ ___  _   _  ___")
    logging.info("      | ___ \\ '_ ` _ \\| | | |/ __|")
    logging.info("      | |_/ / | | | | | |_| | (__")
    logging.info("      |____/|_| |_| |_|\\__, |\\___|")
    logging.info("                       |___/")
    log_horizontal_rule("_")
