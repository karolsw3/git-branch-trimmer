# Git Branch Trimmer

![Git Branch Trimmer Hero](src/public/readme-hero.png)

A CLI tool to help you detect and remove stale Git branches from your repository. This tool analyzes your Git branches and helps you identify which ones can be safely deleted, based on whether they have remote counterparts and how long it's been since their last commit.

## Installation

You can install the package globally using npm:

```bash
npm install -g git-branch-trimmer
```

Or using pnpm:

```bash
pnpm add -g git-branch-trimmer
```

## Usage

Once installed, you can use the `git-branch-trimmer` command in any Git repository:

```bash
git-branch-trimmer
```

With options:

```bash
# Set a custom stale threshold in days (default: 30)
git-branch-trimmer --stale-threshold 60

# Dry run mode (show what would be deleted without actually deleting)
git-branch-trimmer --dry-run

# Skip confirmation prompt
git-branch-trimmer --force
```

The tool will:

1. Scan your repository for all branches
2. Analyze which branches are stale based on:
   - Branches without remote counterparts (always considered stale)
   - Branches with remote counterparts that haven't been updated in a configurable number of days
3. Present you with an interactive menu to select which branches to delete, showing the last commit date and remote status
4. Safely remove the selected branches

## Features

- Identifies stale branches using two criteria:
  - Branches with no remote counterparts
  - Branches that haven't been updated in a configurable number of days (default: 30)
- Interactive branch selection with detailed information
- Customizable stale threshold via command-line option
- Safe branch deletion with confirmation
- Visual feedback with colored output
- Works with any Git repository

## Command Line Options

| Option                         | Description                                                                 |
| ------------------------------ | --------------------------------------------------------------------------- |
| `-t, --stale-threshold <days>` | Set the threshold in days for a branch to be considered stale (default: 30) |
| `-d, --dry-run`                | Show what would be deleted without actually deleting                        |
| `-f, --force`                  | Skip confirmation prompt                                                    |

## Requirements

- Node.js 16 or higher
- Git installed on your system

## License

[WTFPL](https://www.wtfpl.net/)
