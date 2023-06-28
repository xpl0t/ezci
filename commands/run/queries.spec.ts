import * as inquirer from '@inquirer/prompts';
import { getReleaseBranches } from './git';
import { checkForVersionUpgrade, pickReleaseBranch } from './queries';

jest.mock('@inquirer/prompts');
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
    (inquirer.select as unknown as jest.Mock).mockResolvedValue('t');
    await pickReleaseBranch('release/');

    expect(getReleaseBranches).toHaveBeenCalledTimes(1);
  });

  test('pickReleaseBranch should throw when no release pipelines where found', async () => {
    (getReleaseBranches as jest.Mock).mockResolvedValue([]);
    await expect(pickReleaseBranch('release/')).rejects.toThrowError('No release branches!');
  });

  test('pickReleaseBranch should return inquirer output', async () => {
    const expectedPick = 'release/some';
    (inquirer.select as unknown as jest.Mock).mockResolvedValue(expectedPick);

    const pick = await pickReleaseBranch('release/');
    expect(pick).toBe(expectedPick);
  });

  test('pickReleaseBranch should use correct inquirer options', async () => {
    (inquirer.select as unknown as jest.Mock).mockImplementation(async questions => {
      expect(questions).toEqual({
        choices: [ 'release/test', 'release/prod' ].map(b => ({ value: b })),
        message: 'Which branch should be pushed?'
      });

      return 'release/test';
    });

    await pickReleaseBranch('release/');
  });

  test('checkForVersionUpgrade should do nothing if yes was selected', async () => {
    (inquirer.confirm as unknown as jest.Mock).mockResolvedValue(true);
    (jest.spyOn(process, 'exit') as unknown as jest.Mock).mockImplementation(status => {
      throw new Error('exit should not be called on "yes"!');
    });

    await checkForVersionUpgrade({ info: jest.fn() } as any, '', '');
  });

  test('checkForVersionUpgrade should exit with status 0 if "no" was selected', async () => {
    let status = null;

    (inquirer.confirm as unknown as jest.Mock).mockResolvedValue(false);
    (jest.spyOn(process, 'exit') as unknown as jest.Mock).mockImplementation(s => {
      status = s;
    });

    await checkForVersionUpgrade({ info: jest.fn() } as any, '', '');
    expect(status).toBe(0);
  });

  test('checkForVersionUpgrade should use correct inquirer options', async () => {
    (inquirer.confirm as unknown as jest.Mock).mockImplementation(async questions => {
      expect(questions).toEqual({
        message: 'This action will overwrite "t" with "i" and force push "t" to the remote.\nAre you sure to proceed?',
        default: true
      });

      return true;
    });

    await checkForVersionUpgrade({ info: jest.fn() } as any, 'i', 't');
  });

});
