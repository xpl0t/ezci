import { Logger } from '@caporal/core';
import * as sharedGit from '../../shared/git';
import * as git from './git';
import { checkBranchChanged, checkWorkingTreeClean, updateTargetBranch } from './git';
import * as queries from './queries';
import { checkForVersionUpgrade } from './queries';
import { runAction } from './run';

jest.mock('../../shared/git');
jest.mock('./git');
jest.mock('./queries');

describe('runAction', () => {

  let logger: Logger;

  beforeEach(() => {
    (sharedGit.getCurrentBranch as jest.Mock).mockResolvedValue('main');
    (git.getReleaseBranches as jest.Mock).mockResolvedValue([ 'release/test', 'release/prod' ]);
    (queries.pickReleaseBranch as jest.Mock).mockResolvedValue('release/test');

    logger = {
      debug: jest.fn(),
      info: jest.fn()
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('run command should pick branch if none is specified', async () => {
    await runAction({ logger, options: { branchPattern: '' } });
    expect(queries.pickReleaseBranch).toHaveBeenCalledTimes(1);
  });

  test('run command should not pick branch if one is specified', async () => {
    await runAction({ logger, options: { branchPattern: '', branch: 'release/test' } });
    expect(queries.pickReleaseBranch).not.toHaveBeenCalled();
  });

  test('run command should check if target branch exists', async () => {
    await runAction({ logger, options: { branchPattern: '' } });
    expect(git.checkBranchExists).toHaveBeenCalledTimes(1);
  });

  test('run command should throw if release branch is current branch', async () => {
    (queries.pickReleaseBranch as jest.Mock).mockResolvedValue('main');
    await expect(runAction({ logger, options: { branchPattern: '' } })).rejects.toThrowError('Current branch = target branch!');
  });

  test('run command should ask for version upgrade', async () => {
    await runAction({ logger, options: { branchPattern: '' } });
    expect(checkForVersionUpgrade).toHaveBeenCalledTimes(1);
  });

  test('run command should check if working tree is clean', async () => {
    await runAction({ logger, options: { branchPattern: '' } });
    expect(checkWorkingTreeClean).toHaveBeenCalledTimes(1);
  });

  test('run command should update target branch', async () => {
    await runAction({ logger, options: { branchPattern: '' } });
    expect(updateTargetBranch).toHaveBeenCalledTimes(1);
  });

  test('run command should call checkCurrentBranch if updateTargetBranch failed', async () => {
    (git.updateTargetBranch as jest.Mock).mockImplementation(async () => { throw new Error(); });
    await expect(runAction({ logger, options: { branchPattern: '' } })).rejects.toThrowError();
    expect(checkBranchChanged).toHaveBeenCalledTimes(1);
  });

  test('run command should not check current branch if update branch succeeded', async () => {
    await runAction({ logger, options: { branchPattern: '' } });
    expect(checkBranchChanged).not.toHaveBeenCalled();
  });

  test('run command should debug log branch resetting information', async () => {
    await runAction({ logger, options: { branchPattern: '' } });
    expect((logger.debug as jest.Mock).mock.calls[0][0]).toBe('main ➔ release/test');
  });

});
