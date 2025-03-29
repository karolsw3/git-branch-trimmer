import inquirer from 'inquirer';
import { Branch } from '../../domain/interfaces';
import { InquirerUI } from '../inquirer-ui';

// Mock inquirer
jest.mock('inquirer', () => ({
  __esModule: true,
  default: {
    prompt: jest.fn(),
  },
}));

describe('InquirerUI', () => {
  let ui: InquirerUI;
  let mockPrompt: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Get the mocked prompt function
    mockPrompt = inquirer.prompt as unknown as jest.Mock;
    ui = new InquirerUI();
  });

  describe('selectBranches', () => {
    it('should return selected branches', async () => {
      const date1 = new Date('2023-01-10T12:00:00');
      const date2 = new Date('2023-01-15T12:00:00');
      
      const branches: Branch[] = [
        { name: 'feature/1', remote: null, lastCommit: 'abc123', lastCommitDate: date1 },
        { name: 'feature/2', remote: 'origin/feature/2', lastCommit: 'def456', lastCommitDate: date2 },
      ];

      mockPrompt.mockResolvedValue({
        selectedBranches: ['feature/1'],
      });

      const result = await ui.selectBranches(branches);

      expect(result).toEqual(['feature/1']);
      expect(mockPrompt).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'checkbox',
          name: 'selectedBranches',
          message: 'Select branches to delete:',
          choices: expect.arrayContaining([
            expect.objectContaining({ 
              name: `feature/1 - Last commit: ${date1.toLocaleDateString()} (no remote)`, 
              value: 'feature/1' 
            }),
            expect.objectContaining({ 
              name: `feature/2 - Last commit: ${date2.toLocaleDateString()} (has remote: origin/feature/2)`, 
              value: 'feature/2' 
            }),
          ]),
        }),
      ]);
    });

    it('should return empty array when no branches selected', async () => {
      const date1 = new Date('2023-01-10T12:00:00');
      const date2 = new Date('2023-01-15T12:00:00');
      
      const branches: Branch[] = [
        { name: 'feature/1', remote: null, lastCommit: 'abc123', lastCommitDate: date1 },
        { name: 'feature/2', remote: 'origin/feature/2', lastCommit: 'def456', lastCommitDate: date2 },
      ];

      mockPrompt.mockResolvedValue({
        selectedBranches: [],
      });

      const result = await ui.selectBranches(branches);
      expect(result).toEqual([]);
    });
    
    it('should display branch information correctly', async () => {
      // Create a mix of branches - with and without remotes
      const oldDate = new Date('2022-12-15T12:00:00');
      const recentDate = new Date('2023-01-15T12:00:00');
      
      const branches: Branch[] = [
        { name: 'feature/old', remote: null, lastCommit: 'abc123', lastCommitDate: oldDate },
        { name: 'feature/recent', remote: 'origin/feature/recent', lastCommit: 'def456', lastCommitDate: recentDate },
      ];

      mockPrompt.mockResolvedValue({
        selectedBranches: ['feature/old'],
      });

      await ui.selectBranches(branches);

      // Verify logger output would have the correct information
      expect(mockPrompt).toHaveBeenCalledWith([
        expect.objectContaining({
          choices: [
            {
              name: `feature/old - Last commit: ${oldDate.toLocaleDateString()} (no remote)`,
              value: 'feature/old',
            },
            {
              name: `feature/recent - Last commit: ${recentDate.toLocaleDateString()} (has remote: origin/feature/recent)`,
              value: 'feature/recent', 
            },
          ],
        }),
      ]);
    });
  });

  describe('confirmDeletion', () => {
    it('should return true when user confirms deletion', async () => {
      mockPrompt.mockResolvedValue({
        confirm: true,
      });

      const result = await ui.confirmDeletion(2);

      expect(result).toBe(true);
      expect(mockPrompt).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to delete 2 branch(es)?',
          default: false,
        }),
      ]);
    });

    it('should return false when user cancels deletion', async () => {
      mockPrompt.mockResolvedValue({
        confirm: false,
      });

      const result = await ui.confirmDeletion(1);

      expect(result).toBe(false);
      expect(mockPrompt).toHaveBeenCalledWith([
        expect.objectContaining({
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to delete 1 branch(es)?',
          default: false,
        }),
      ]);
    });
  });
});
