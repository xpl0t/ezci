import * as inquirer from 'inquirer';
import { getReleaseBranches } from './git';
import { checkForVersionUpgrade, pickReleaseBranch } from './queries';

jest.mock('inquirer');
jest.mock('./git');

describe('queries', () => {

  beforeEach(() => {
    (getReleaseBranches as jest.Mock).mockResolvedValue([ 'release/test', 'release/prod' ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('pickReleaseBranch should get release pipelines', async () => {
    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ branch: 't' });
    await pickReleaseBranch('release/');

    expect(getReleaseBranches).toHaveBeenCalledTimes(1);
  });

  test('pickReleaseBranch should throw when no release pipelines where found', async () => {
    (getReleaseBranches as jest.Mock).mockResolvedValue([]);
    await expect(pickReleaseBranch('release/')).rejects.toThrowError('No release branches!');
  });

  test('pickReleaseBranch should return inquirer output', async () => {
    const expectedPick = 'release/some';
    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue({ branch: expectedPick });

    const pick = await pickReleaseBranch('release/');
    expect(pick).toBe(expectedPick);
  });

  test('pickReleaseBranch should use correct inquirer options', async () => {
    (inquirer.prompt as unknown as jest.Mock).mockImplementation(async questions => {
      expect(questions).toEqual([{
        type: 'list',
        name: 'branch',
        choices: [ 'release/test', 'release/prod' ],
        message: 'Which branch should be pushed?'
      }]);

      return { branch: 'release/test' };
    });

    await pickReleaseBranch('release/');
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
