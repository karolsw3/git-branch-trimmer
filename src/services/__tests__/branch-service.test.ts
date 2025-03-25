import { BranchService } from '../branch-service';
import { simpleGit } from 'simple-git';

// Mock simple-git
jest.mock('simple-git', () => ({
  simpleGit: jest.fn(),
}));

describe('BranchService', () => {
  let branchService: BranchService;
  let mockGit: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock Git instance
    mockGit = {
      branchLocal: jest.fn(),
      branch: jest.fn(),
      checkIsRepo: jest.fn(),
    };

    // Setup the mock implementation
    (simpleGit as jest.Mock).mockReturnValue(mockGit);

    branchService = new BranchService();
  });

  describe('checkIsRepo', () => {
    it('should return true when in a Git repository', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      const result = await branchService.checkIsRepo();
      expect(result).toBe(true);
    });

    it('should return false when not in a Git repository', async () => {
      mockGit.checkIsRepo.mockResolvedValue(false);
      const result = await branchService.checkIsRepo();
      expect(result).toBe(false);
    });
  });

  describe('getStaleBranches', () => {
    it('should return empty array when no stale branches found', async () => {
      mockGit.branchLocal.mockResolvedValue({
        current: 'main',
        branches: {
          main: { commit: 'abc123' },
        },
      });
      mockGit.branch.mockResolvedValue({
        all: ['origin/main'],
      });

      const result = await branchService.getStaleBranches();
      expect(result).toEqual([]);
    });

    it('should identify stale branches correctly', async () => {
      mockGit.branchLocal.mockResolvedValue({
        current: 'main',
        branches: {
          main: { commit: 'abc123' },
          'feature/old': { commit: 'def456' },
          'feature/new': { commit: 'ghi789' },
        },
      });
      mockGit.branch.mockResolvedValue({
        all: ['origin/main', 'origin/feature/new'],
      });

      const result = await branchService.getStaleBranches();
      expect(result).toEqual([
        {
          name: 'feature/old',
          remote: null,
          lastCommit: 'def456',
        },
      ]);
    });
  });

  describe('deleteBranches', () => {
    it('should delete branches successfully', async () => {
      const branches = ['feature/old', 'feature/stale'];
      mockGit.branch.mockResolvedValue(undefined);

      await branchService.deleteBranches(branches);
      expect(mockGit.branch).toHaveBeenCalledTimes(2);
      expect(mockGit.branch).toHaveBeenCalledWith(['-D', 'feature/old']);
      expect(mockGit.branch).toHaveBeenCalledWith(['-D', 'feature/stale']);
    });

    it('should throw error when branch deletion fails', async () => {
      const branches = ['feature/old'];
      mockGit.branch.mockRejectedValue(new Error('Failed to delete branch'));

      await expect(branchService.deleteBranches(branches)).rejects.toThrow('Failed to delete branch');
    });
  });
}); 