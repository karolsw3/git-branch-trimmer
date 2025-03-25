import { simpleGit, SimpleGit, BranchSummary } from 'simple-git';
import { BranchService } from '../branch-service';

// Mock simple-git
jest.mock('simple-git', () => ({
  simpleGit: jest.fn(),
}));

describe('BranchService', () => {
  let branchService: BranchService;
  let mockGit: jest.Mocked<SimpleGit>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock Git instance
    mockGit = {
      branchLocal: jest.fn(),
      branch: jest.fn(),
      checkIsRepo: jest.fn(),
    } as unknown as jest.Mocked<SimpleGit>;

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
      const mockBranchSummary: BranchSummary = {
        current: 'main',
        detached: false,
        all: ['main'],
        branches: {
          main: {
            current: true,
            name: 'main',
            commit: 'abc123',
            label: 'main',
            linkedWorkTree: false,
          },
        },
      };
      mockGit.branchLocal.mockResolvedValue(mockBranchSummary);
      mockGit.branch.mockResolvedValue({
        ...mockBranchSummary,
        all: ['origin/main'],
      });

      const result = await branchService.getStaleBranches();
      expect(result).toEqual([]);
    });

    it('should identify stale branches correctly', async () => {
      const mockBranchSummary: BranchSummary = {
        current: 'main',
        detached: false,
        all: ['main', 'feature/old', 'feature/new'],
        branches: {
          main: {
            current: true,
            name: 'main',
            commit: 'abc123',
            label: 'main',
            linkedWorkTree: false,
          },
          'feature/old': {
            current: false,
            name: 'feature/old',
            commit: 'def456',
            label: 'feature/old',
            linkedWorkTree: false,
          },
          'feature/new': {
            current: false,
            name: 'feature/new',
            commit: 'ghi789',
            label: 'feature/new',
            linkedWorkTree: false,
          },
        },
      };
      mockGit.branchLocal.mockResolvedValue(mockBranchSummary);
      mockGit.branch.mockResolvedValue({
        ...mockBranchSummary,
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
      const mockBranchSummary: BranchSummary = {
        current: 'main',
        detached: false,
        all: ['main'],
        branches: {},
      };
      mockGit.branch.mockResolvedValue(mockBranchSummary);

      await branchService.deleteBranches(branches);
      expect(mockGit.branch).toHaveBeenCalledTimes(2);
      expect(mockGit.branch).toHaveBeenCalledWith(['-D', 'feature/old']);
      expect(mockGit.branch).toHaveBeenCalledWith(['-D', 'feature/stale']);
    });

    it('should throw error when branch deletion fails', async () => {
      const branches = ['feature/old'];
      mockGit.branch.mockRejectedValue(new Error('Failed to delete branch'));

      await expect(branchService.deleteBranches(branches)).rejects.toThrow(
        'Failed to delete branch',
      );
    });
  });
});
