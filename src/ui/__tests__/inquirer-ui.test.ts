import { InquirerUI } from '../inquirer-ui';
import { Branch } from '../../domain/interfaces';

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
    mockPrompt = jest.requireMock('inquirer').default.prompt;
    ui = new InquirerUI();
  });

  describe('selectBranches', () => {
    it('should return selected branches', async () => {
      const branches: Branch[] = [
        { name: 'feature/1', remote: null, lastCommit: 'abc123' },
        { name: 'feature/2', remote: null, lastCommit: 'def456' },
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
            expect.objectContaining({ name: 'feature/1', value: 'feature/1' }),
            expect.objectContaining({ name: 'feature/2', value: 'feature/2' }),
          ]),
        }),
      ]);
    });

    it('should return empty array when no branches selected', async () => {
      const branches: Branch[] = [
        { name: 'feature/1', remote: null, lastCommit: 'abc123' },
        { name: 'feature/2', remote: null, lastCommit: 'def456' },
      ];

      mockPrompt.mockResolvedValue({
        selectedBranches: [],
      });

      const result = await ui.selectBranches(branches);
      expect(result).toEqual([]);
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