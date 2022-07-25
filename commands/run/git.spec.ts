import * as func from '../../shared/func';
import * as git from '../../shared/git';
import { checkBranchChanged, checkBranchExists, checkoutBranchLog, checkWorkingTreeClean, getReleaseBranches, updateTargetBranch } from './git';

jest.mock('../../shared/git');
jest.mock('../../shared/func');

describe('git', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('getReleaseBranches should filter branches, that dont start with the branch pattern', async () => {
    const branchPattern = 'release/';
    (git.getBranches as jest.Mock).mockResolvedValue([ 'main', 'release/one', 'release/two', 'two/release/', 'test' ]);
    (git.getRemoteBranches as jest.Mock).mockResolvedValue([ 'onerelease/two', 'release/' ]);

    const branches = await getReleaseBranches(branchPattern);
    expect(branches).toEqual([ 'release/one', 'release/two', 'release/' ]);
  });

  test('getReleaseBranches should return an empty array, if the branch pattern is null|undefined', async () => {
    (git.getBranches as jest.Mock).mockResolvedValue([ 'main', 'release/one', 'release/two', 'two/release/', 'test', 'onerelease/two', 'release/' ]);
    (git.getRemoteBranches as jest.Mock).mockResolvedValue([]);

    const resNull = await getReleaseBranches(null);
    const resUndefined = await getReleaseBranches(undefined);
    expect(resNull).toEqual([]);
    expect(resUndefined).toEqual([]);
  });

  test('getReleaseBranches should return all branches, if the branch pattern ist an empty string', async () => {
    const mockBranches = [ 'main', 'release/one', 'release/two', 'two/release/', 'test', 'onerelease/two', 'release/' ];
    (git.getBranches as jest.Mock).mockResolvedValue(mockBranches);
    (git.getRemoteBranches as jest.Mock).mockResolvedValue([]);

    const branches = await getReleaseBranches('');
    expect(branches).toEqual(mockBranches);
  });

  test('getReleaseBranches should return local and remote branches', async () => {
    (git.getBranches as jest.Mock).mockResolvedValue([ 'release/one' ]);
    (git.getRemoteBranches as jest.Mock).mockResolvedValue([ 'release/one', 'releae/two' ]);

    const branches = await getReleaseBranches('');
    expect(branches).toEqual([ 'release/one', 'releae/two' ]);
  });

  test('checkBranchExists should throw if the branch does not exist', async () => {
    const mockBranches = [ 't', 't2' ];
    (git.getBranches as jest.Mock).mockResolvedValue(mockBranches);

    await expect(checkBranchExists('404branch')).rejects.toThrowError('"404branch" is no known branch! Available branches: "t", "t2"');
  });

  test('checkBranchExists should not throw if the branch does exist', async () => {
    const mockBranches = [ 't', '200branchfound', 't2' ];
    (git.getBranches as jest.Mock).mockResolvedValue(mockBranches);

    await checkBranchExists('200branchfound');
  });

  test('checkWorkingTreeClean should throw if working tree is not clean', async () => {
    (git.isWorkingTreeClean as jest.Mock).mockResolvedValue(false);
    await expect(checkWorkingTreeClean).rejects.toThrowError();
  });

  test('checkWorkingTreeClean should do nothing if working tree is clean', async () => {
    (git.isWorkingTreeClean as jest.Mock).mockResolvedValue(true);
    await checkWorkingTreeClean();git
  });

  test('checkoutBranchLog call checkoutBranch correctly', async () => {
    const targetBranch = 'test123';
    (git.checkoutBranch as jest.Mock).mockImplementation(branch => {
      expect(branch).toBe(targetBranch);
    })

    await checkoutBranchLog({ debug: jest.fn() } as any, targetBranch);
    expect(git.checkoutBranch).toHaveBeenCalledTimes(1);
  });

  test('checkoutBranchLog should write debug log', async () => {
    const debugMock = jest.fn();
    await checkoutBranchLog({ debug: debugMock } as any, 'test');

    expect(debugMock).toHaveBeenCalledTimes(1);
  });

  test('checkBranchChanged should write warn log, if branch changed', async () => {
    (git.getCurrentBranch as jest.Mock).mockResolvedValue('release/test');
    const warnMock = jest.fn();
    await checkBranchChanged({ warn: warnMock } as any, 'main');

    expect(warnMock).toHaveBeenCalledTimes(1);
  });

  test('checkBranchChanged should not write log, if branch did not change', async () => {
    (git.getCurrentBranch as jest.Mock).mockResolvedValue('main');
    const warnMock = jest.fn();
    await checkBranchChanged({ warn: warnMock } as any, 'main');

    expect(warnMock).not.toHaveBeenCalled();
  });

});

describe('git update branch', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('updateBranch should run the right commands in the right order', async () => {
    const loggerMock = { info: jest.fn(), debug: jest.fn() };
    const currentBranch = 'main';
    const targetBranch = 'release/test';

    await updateTargetBranch(loggerMock as any, currentBranch, targetBranch);

    const getInvocationArgMap = (mockFn: jest.Mock): [ number, string[] ][] => {
      return mockFn.mock.invocationCallOrder.map((o, i) => [ o, mockFn.mock.calls[i] ]);
    }

    const invocationArgMap = [
      ...getInvocationArgMap(git.checkoutBranch as jest.Mock),
      ...getInvocationArgMap(func.runCommand as jest.Mock)
    ]
      .sort((a, b) => a[0] - b[0])
      .map(v => v[1]);

    const expectedInvocationArgMap = [
      [ targetBranch ],
      [ 'git', [ 'reset', '--hard', currentBranch ]],
      [ 'git', [ 'push', '-f' ]],
      [ currentBranch ],
    ];

    expect(invocationArgMap).toEqual(expectedInvocationArgMap);
  });

  test('updateBranch should log the progress', async () => {
    const loggerMock = { info: jest.fn(), debug: jest.fn() };

    await updateTargetBranch(loggerMock as any, '', '');
    expect(loggerMock.info).toHaveBeenCalledTimes(2);
  });

});
