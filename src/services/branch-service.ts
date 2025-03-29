import { SimpleGit, simpleGit } from 'simple-git';
import { Branch, IBranchService } from '../domain/interfaces';
import { LoggerFactory } from '../utils/logger/logger-factory';

const logger = LoggerFactory.createLogger({ prefix: 'branch-service' });
const DEFAULT_STALE_THRESHOLD_DAYS = 30; // Default threshold for stale branches in days

export class BranchService implements IBranchService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async getStaleBranches(options?: { staleThreshold?: number }): Promise<Branch[]> {
    const staleThresholdDays = options?.staleThreshold || DEFAULT_STALE_THRESHOLD_DAYS;

    // Get all local branches
    const localBranches = await this.git.branchLocal();

    // Get all remote branches
    const remoteBranches = await this.git.branch(['-r']);

    // Create a map of remote branch names (without 'origin/' prefix)
    const remoteBranchMap = new Map<string, string>();
    remoteBranches.all
      .filter((branch) => branch.startsWith('origin/'))
      .forEach((branch) => {
        const localName = branch.replace('origin/', '');
        remoteBranchMap.set(localName, branch);
      });

    // Calculate the cutoff date for stale branches
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - staleThresholdDays);

    // Get all stale branches
    const staleBranches: Branch[] = [];

    // Filter out the current branch and main/master
    for (const [name, info] of Object.entries(localBranches.branches)) {
      const isCurrent = name === localBranches.current;
      const isMain = name === 'main' || name === 'master';

      if (!isCurrent && !isMain) {
        // Get last commit date
        const lastCommitDetails = await this.git.show([
          '-s',
          '--format=%cd',
          '--date=iso',
          info.commit,
        ]);

        const lastCommitDate = new Date(lastCommitDetails.trim());
        const hasRemote = remoteBranchMap.has(name);
        const remote = hasRemote ? remoteBranchMap.get(name) || null : null;

        // Check if branch is stale:
        // 1. No remote counterpart, or
        // 2. Has remote but last commit is older than threshold
        if (!hasRemote || lastCommitDate < cutoffDate) {
          staleBranches.push({
            name,
            remote,
            lastCommit: info.commit,
            lastCommitDate,
          });
        }
      }
    }

    // Sort branches by last commit date (oldest first)
    staleBranches.sort((a, b) => a.lastCommitDate.getTime() - b.lastCommitDate.getTime());

    return staleBranches;
  }

  async deleteBranches(branches: string[]): Promise<void> {
    for (const branch of branches) {
      try {
        await this.git.branch(['-D', branch]);
        logger.success(`✓ Deleted branch: ${branch}`);
      } catch (error) {
        logger.error(`✗ Failed to delete branch ${branch}: ${error}`);
        throw error;
      }
    }
  }

  async checkIsRepo(): Promise<boolean> {
    return this.git.checkIsRepo();
  }
}
