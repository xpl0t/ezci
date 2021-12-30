import * as inquirer from 'inquirer';
import { checkForVersionUpgrade, pickReleaseBranch } from './queries';

jest.mock('inquirer');

describe('queries', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('pickReleaseBranch should return inquirer output', async () => {
    const expectedPick = 'release/some';
    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ branch: expectedPick });

    const pick = await pickReleaseBranch([ expectedPick ]);
    expect(pick).toBe(expectedPick);
  });

  test('pickReleaseBranch should use correct inquirer options', async () => {
    const choices = [ 'release-branch-1', 'release-branch-2' ];

    (inquirer.prompt as unknown as jest.Mock).mockImplementation(async questions => {
      expect(questions).toEqual([{
        type: 'list',
        name: 'branch',
        choices,
        message: 'Which branch should be pushed?'
      }]);

      return { branch: 'test' };
    });

    await pickReleaseBranch(choices);
  });

  test('checkForVersionUpgrade should do nothing if yes was selected', async () => {
    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ version: 'yes' });
    (jest.spyOn(process, 'exit') as unknown as jest.Mock).mockImplementation(status => {
      throw new Error('exit should not be called on "yes"!');
    });

    await checkForVersionUpgrade({ info: jest.fn() } as any);
  });

  test('checkForVersionUpgrade should exit with status 0 if "no" was selected', async () => {
    let status = null;

    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ version: 'no' });
    (jest.spyOn(process, 'exit') as unknown as jest.Mock).mockImplementation(s => {
      status = s;
    });

    await checkForVersionUpgrade({ info: jest.fn() } as any);
    expect(status).toBe(0);
  });

  test('checkForVersionUpgrade should use correct inquirer options', async () => {
    (inquirer.prompt as unknown as jest.Mock).mockImplementation(async questions => {
      expect(questions).toEqual([{
        type: 'list',
        name: 'version',
        choices: [ 'no', 'yes' ],
        message: 'Did you update the version/are you sure to run the pipeline?'
      }]);

      return { version: 'yes' };
    });

    await checkForVersionUpgrade({ info: jest.fn() } as any);
  });

});
