import { SimpleGit, simpleGit } from 'simple-git';
import { Branch, IBranchService } from '../domain/interfaces';
import { LoggerFactory } from '../utils/logger/logger-factory';

const logger = LoggerFactory.createLogger({ prefix: 'branch-service' });

export class BranchService implements IBranchService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async getStaleBranches(): Promise<Branch[]> {
    // Get all local branches
    const localBranches = await this.git.branchLocal();
    
    // Get all remote branches
    const remoteBranches = await this.git.branch(['-r']);
    
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