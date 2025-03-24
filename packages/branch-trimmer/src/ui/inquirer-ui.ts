import { Branch, IUserInterface } from '../domain/interfaces';
import { LoggerFactory } from '../utils/logger/logger-factory';

const logger = LoggerFactory.createLogger({ prefix: 'ui' });

export class InquirerUI implements IUserInterface {
  async selectBranches(branches: Branch[]): Promise<string[]> {
    const inquirer = (await import('inquirer')).default;
    
    logger.warn(`\nFound ${branches.length} stale branches:`);
    branches.forEach((branch, index) => {
      logger.warn(`${index + 1}. ${branch.name}`);
    });

    const { selectedBranches } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedBranches',
        message: 'Select branches to delete:',
        choices: branches.map(branch => ({
          name: branch.name,
          value: branch.name
        }))
      }
    ]);

    return selectedBranches;
  }

  async confirmDeletion(count: number): Promise<boolean> {
    const inquirer = (await import('inquirer')).default;
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete ${count} branch(es)?`,
        default: false
      }
    ]);

    return confirm;
  }
} 