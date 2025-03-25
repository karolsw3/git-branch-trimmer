#!/usr/bin/env node

import { Command } from 'commander';
import { ICommandOptions } from './domain/interfaces';
import { BranchService } from './services/branch-service';
import { InquirerUI } from './ui/inquirer-ui';
import { LoggerFactory } from './utils/logger/logger-factory';

const logger = LoggerFactory.createLogger({ prefix: 'branch-trimmer' });

class BranchTrimmer {
  private branchService: BranchService;
  private ui: InquirerUI;

  constructor() {
    this.branchService = new BranchService();
    this.ui = new InquirerUI();
  }

  async run(options: ICommandOptions): Promise<void> {
    try {
      // Check if we're in a Git repository
      const isRepo = await this.branchService.checkIsRepo();
      if (!isRepo) {
        logger.error('❌ Error: Not a Git repository');
        process.exit(1);
      }

      logger.info('🔍 Searching for stale branches...');
      const staleBranches = await this.branchService.getStaleBranches();

      if (staleBranches.length === 0) {
        logger.success('✨ No stale branches found!');
        process.exit(0);
      }

      const selectedBranches = await this.ui.selectBranches(staleBranches);
      if (selectedBranches.length === 0) {
        logger.info('\nNo branches selected. Exiting...');
        process.exit(0);
      }

      const confirmed = await this.ui.confirmDeletion(selectedBranches.length);
      if (!confirmed) {
        logger.info('\nOperation cancelled.');
        process.exit(0);
      }

      if (options.dryRun) {
        logger.info(`\nDry run: Would delete ${selectedBranches.length} branch(es):`);
        selectedBranches.forEach((branch) => logger.info(`- ${branch}`));
        process.exit(0);
      }

      await this.branchService.deleteBranches(selectedBranches);
      logger.success('\n✨ Branch cleanup completed!');
    } catch (error) {
      logger.error(`Error: ${error}`);
      process.exit(1);
    }
  }
}

async function main() {
  const program = new Command();

  program
    .name('branch-trimmer')
    .description('CLI tool to detect and remove stale Git branches')
    .version('1.0.0')
    .option('-d, --dry-run', 'Show what would be deleted without actually deleting')
    .option('-f, --force', 'Skip confirmation prompt');

  program.parse();

  const options = program.opts() as ICommandOptions;
  const trimmer = new BranchTrimmer();
  await trimmer.run(options);
}

main();
