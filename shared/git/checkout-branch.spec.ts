import * as func from '../func';
import * as git from '.';
import { checkoutBranch } from './checkout-branch.func';

jest.mock('../func');
jest.mock('./get-current-branch.func');

describe('checkoutBranch', () => {

  beforeEach(() => {
    (git.getCurrentBranch as jest.Mock).mockResolvedValue('test123');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('runCommand should be called', async () => {
    const branchName = 'test123';
    (func.runCommand as jest.Mock).mockResolvedValue(`Switched to branch '${branchName}'`);
    const spyRunCommand = jest.spyOn(func, 'runCommand');
    await checkoutBranch(branchName);

    expect(spyRunCommand).toHaveBeenCalledTimes(1);
  });

  test('runCommand should be called with correct parameters', async () => {
    const branchName = 'test123';

    (func.runCommand as jest.Mock).mockImplementation(async (cmd, args) => {
      expect(cmd).toBe('git');
      expect(args).toEqual([ 'checkout', branchName ]);

      return 'Switched to branch main';
    });

    await checkoutBranch(branchName);
  });

  test('checkoutBranch should throw if checkout failed', async () => {
    const branchName = 'some-branch';
    (func.runCommand as jest.Mock).mockResolvedValue(`Switched to branch '${branchName}'`);

    await expect(checkoutBranch(branchName)).rejects.toThrowError(/Checkout failed\! Target branch: \".*\", current branch: \".*\"/);
  });

});
