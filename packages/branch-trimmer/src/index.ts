#!/usr/bin/env node

import { Command } from 'commander';
import simpleGit, { SimpleGit } from 'simple-git';
import chalk from 'chalk';

interface Branch {
  name: string;
  remote: string | null;
  lastCommit: string;
}

async function getStaleBranches(git: SimpleGit): Promise<Branch[]> {
  // Get all local branches
  const localBranches = await git.branchLocal();
  
  // Get all remote branches
  const remoteBranches = await git.branch(['-r']);
  
  // Create a set of remote branch names (without 'origin/' prefix)
  const remoteBranchNames = new Set(
    remoteBranches.all
      .filter(branch => branch.startsWith('origin/'))
      .map(branch => branch.replace('origin/', ''))
  );
  
  // Filter out the current branch and main/master
  const staleBranches = Object.entries(localBranches.branches)
    .filter(([name]) => {
      const isCurrent = name === localBranches.current;
      const isMain = name === 'main' || name === 'master';
      const hasRemote = remoteBranchNames.has(name);
      return !isCurrent && !isMain && !hasRemote;
    })
    .map(([name, info]) => ({
      name,
      remote: null,
      lastCommit: info.commit
    }));
  
  return staleBranches;
}

async function deleteBranches(git: SimpleGit, branches: string[]): Promise<void> {
  for (const branch of branches) {
    try {
      await git.branch(['-D', branch]);
      console.log(chalk.green(`✓ Deleted branch: ${branch}`));
    } catch (error) {
      console.error(chalk.red(`✗ Failed to delete branch ${branch}: ${error}`));
    }
  }
}

async function main() {
  const program = new Command();
  
  program
    .name('branch-trimmer')
    .description('CLI tool to detect and remove stale Git branches')
    .version('1.0.0');
  
  program.parse();
  
  // Check if we're in a Git repository
  const git = simpleGit();
  const isRepo = await git.checkIsRepo();
  
  if (!isRepo) {
    console.error(chalk.red('Error: Not a Git repository'));
    process.exit(1);
  }
  
  console.log(chalk.blue('🔍 Searching for stale branches...'));
  
  const staleBranches = await getStaleBranches(git);
  
  if (staleBranches.length === 0) {
    console.log(chalk.green('✨ No stale branches found!'));
    process.exit(0);
  }
  
  console.log(chalk.yellow(`\nFound ${staleBranches.length} stale branches:`));
  staleBranches.forEach((branch, index) => {
    console.log(chalk.yellow(`${index + 1}. ${branch.name}`));
  });

  // Dynamically import inquirer
  const inquirer = (await import('inquirer')).default;
  
  const { selectedBranches } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedBranches',
      message: 'Select branches to delete:',
      choices: staleBranches.map(branch => ({
        name: branch.name,
        value: branch.name
      }))
    }
  ]);
  
  if (selectedBranches.length === 0) {
    console.log(chalk.blue('\nNo branches selected. Exiting...'));
    process.exit(0);
  }
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete ${selectedBranches.length} branch(es)?`,
      default: false
    }
  ]);
  
  if (!confirm) {
    console.log(chalk.blue('\nOperation cancelled.'));
    process.exit(0);
  }
  
  await deleteBranches(git, selectedBranches);
  console.log(chalk.green('\n✨ Branch cleanup completed!'));
}

main().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
}); 