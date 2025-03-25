export interface Branch {
  name: string;
  remote: string | null;
  lastCommit: string;
}

export interface IBranchService {
  getStaleBranches(): Promise<Branch[]>;
  deleteBranches(branches: string[]): Promise<void>;
}

export interface IUserInterface {
  selectBranches(branches: Branch[]): Promise<string[]>;
  confirmDeletion(count: number): Promise<boolean>;
}

export interface ICommandOptions {
  dryRun?: boolean;
  force?: boolean;
} 