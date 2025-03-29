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

    // Create mock Git instance with properly typed mock functions
    mockGit = {
      branchLocal: jest.fn(),
      branch: jest.fn(),
      checkIsRepo: jest.fn(),
      show: jest.fn(),
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
    beforeEach(() => {
      // Setup date for testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 0, 15)); // Jan 15, 2023
    });

    afterEach(() => {
      jest.useRealTimers();
    });

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

    it('should identify branches with no remote as stale', async () => {
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

      // Mock commit dates
      mockGit.show.mockResolvedValue('2023-01-10T12:00:00');

      const result = await branchService.getStaleBranches();

      // Assert we got one result
      expect(result).toHaveLength(1);

      // All our tests use expect.assertions to ensure the assertions are actually run
      expect.assertions(5);

      // Instead of checking length, we'll just trust our expectation above
      // and use non-null assertion
      expect(result[0]!.name).toBe('feature/old');
      expect(result[0]!.remote).toBeNull();
      expect(result[0]!.lastCommit).toBe('def456');
      expect(result[0]!.lastCommitDate).toEqual(new Date('2023-01-10T12:00:00'));
    });

    it('should identify branches with old commits as stale', async () => {
      const mockBranchSummary: BranchSummary = {
        current: 'main',
        detached: false,
        all: ['main', 'feature/recent', 'feature/old-with-remote'],
        branches: {
          main: {
            current: true,
            name: 'main',
            commit: 'abc123',
            label: 'main',
            linkedWorkTree: false,
          },
          'feature/recent': {
            current: false,
            name: 'feature/recent',
            commit: 'def456',
            label: 'feature/recent',
            linkedWorkTree: false,
          },
          'feature/old-with-remote': {
            current: false,
            name: 'feature/old-with-remote',
            commit: 'ghi789',
            label: 'feature/old-with-remote',
            linkedWorkTree: false,
          },
        },
      };
      mockGit.branchLocal.mockResolvedValue(mockBranchSummary);
      mockGit.branch.mockResolvedValue({
        ...mockBranchSummary,
        all: ['origin/main', 'origin/feature/recent', 'origin/feature/old-with-remote'],
      });

      // Simple way to mock the show method for this test
      mockGit.show
        .mockResolvedValueOnce('2023-01-05T12:00:00') // For def456
        .mockResolvedValueOnce('2022-11-16T12:00:00'); // For ghi789

      const result = await branchService.getStaleBranches({ staleThreshold: 30 });

      expect(result).toHaveLength(1);
      expect.assertions(4);

      expect(result[0]!.name).toBe('feature/old-with-remote');
      expect(result[0]!.remote).toBe('origin/feature/old-with-remote');
      expect(result[0]!.lastCommitDate).toEqual(new Date('2022-11-16T12:00:00'));
    });

    it('should respect the custom stale threshold', async () => {
      const mockBranchSummary: BranchSummary = {
        current: 'main',
        detached: false,
        all: ['main', 'feature/7-days-old', 'feature/15-days-old'],
        branches: {
          main: {
            current: true,
            name: 'main',
            commit: 'abc123',
            label: 'main',
            linkedWorkTree: false,
          },
          'feature/7-days-old': {
            current: false,
            name: 'feature/7-days-old',
            commit: 'def456',
            label: 'feature/7-days-old',
            linkedWorkTree: false,
          },
          'feature/15-days-old': {
            current: false,
            name: 'feature/15-days-old',
            commit: 'ghi789',
            label: 'feature/15-days-old',
            linkedWorkTree: false,
          },
        },
      };
      mockGit.branchLocal.mockResolvedValue(mockBranchSummary);
      mockGit.branch.mockResolvedValue({
        ...mockBranchSummary,
        all: ['origin/main', 'origin/feature/7-days-old', 'origin/feature/15-days-old'],
      });

      // Simple way to mock the show method for this test
      mockGit.show
        .mockResolvedValueOnce('2023-01-08T12:00:00') // For def456
        .mockResolvedValueOnce('2022-12-31T12:00:00'); // For ghi789

      // Using a 10-day threshold, only the 15-day old branch should be stale
      const result = await branchService.getStaleBranches({ staleThreshold: 10 });

      expect(result).toHaveLength(1);
      expect.assertions(2);

      expect(result[0]!.name).toBe('feature/15-days-old');
    });

    it('should sort stale branches by age (oldest first)', async () => {
      const mockBranchSummary: BranchSummary = {
        current: 'main',
        detached: false,
        all: ['main', 'feature/medium-old', 'feature/very-old', 'feature/less-old'],
        branches: {
          main: {
            current: true,
            name: 'main',
            commit: 'abc123',
            label: 'main',
            linkedWorkTree: false,
          },
          'feature/medium-old': {
            current: false,
            name: 'feature/medium-old',
            commit: 'def456',
            label: 'feature/medium-old',
            linkedWorkTree: false,
          },
          'feature/very-old': {
            current: false,
            name: 'feature/very-old',
            commit: 'ghi789',
            label: 'feature/very-old',
            linkedWorkTree: false,
          },
          'feature/less-old': {
            current: false,
            name: 'feature/less-old',
            commit: 'jkl012',
            label: 'feature/less-old',
            linkedWorkTree: false,
          },
        },
      };
      mockGit.branchLocal.mockResolvedValue(mockBranchSummary);
      mockGit.branch.mockResolvedValue({
        ...mockBranchSummary,
        all: ['origin/main'],
      });

      // Simple way to mock the show method for this test
      mockGit.show
        .mockResolvedValueOnce('2022-12-15T12:00:00') // For def456
        .mockResolvedValueOnce('2022-11-15T12:00:00') // For ghi789
        .mockResolvedValueOnce('2022-12-25T12:00:00'); // For jkl012

      const result = await branchService.getStaleBranches();

      expect(result).toHaveLength(3);
      expect.assertions(4);

      // Should be sorted oldest first
      expect(result[0]!.name).toBe('feature/very-old');
      expect(result[1]!.name).toBe('feature/medium-old');
      expect(result[2]!.name).toBe('feature/less-old');
    });
  });

  describe('deleteBranches', () => {
    it('should delete branches successfully', async () => {
      const branches = ['feature/old', 'feature/stale'];
      mockGit.branch.mockResolvedValueOnce({} as BranchSummary);
      mockGit.branch.mockResolvedValueOnce({} as BranchSummary);

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
