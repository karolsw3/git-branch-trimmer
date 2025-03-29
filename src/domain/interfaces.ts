export interface Branch {
  name: string;
  remote: string | null;
  lastCommit: string;
  lastCommitDate: Date;
}

export interface IBranchService {
  getStaleBranches(options?: { staleThreshold?: number }): Promise<Branch[]>;
  deleteBranches(branches: string[]): Promise<void>;
}

export interface IUserInterface {
  selectBranches(branches: Branch[]): Promise<string[]>;
  confirmDeletion(count: number): Promise<boolean>;
}

export interface ICommandOptions {
  dryRun?: boolean;
  force?: boolean;
  staleThreshold?: number;
}
