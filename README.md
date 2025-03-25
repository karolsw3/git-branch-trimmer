# Git Branch Trimmer

![Git Branch Trimmer Hero](src/public/readme-hero.png)

A CLI tool to help you detect and remove stale Git branches from your repository. This tool analyzes your Git branches and helps you identify which ones can be safely deleted.

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

The tool will:

1. Scan your repository for all branches
2. Analyze which branches are stale (based on last commit date and merge status)
3. Present you with an interactive menu to select which branches to delete
4. Safely remove the selected branches

## Features

- Interactive branch selection
- Safe branch deletion with confirmation
- Visual feedback with colored output
- Works with any Git repository

## Requirements

- Node.js 16 or higher
- Git installed on your system

## License

MIT
