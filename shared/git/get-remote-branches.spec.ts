import * as func from '../func';
import * as git from '.';
import { getRemoteBranches } from './get-remote-branches.func';

jest.mock('../func');
jest.mock('./get-remote-name.func');

describe('getRemoteBranches', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('runCommand should be called', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue('main\ntest\n');
    const spyRunCommand = jest.spyOn(func, 'runCommand');
    await getRemoteBranches();

    expect(spyRunCommand).toHaveBeenCalledTimes(1);
  });

  test('runCommand should be called with correct parameters', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue('main\ntest\n');
    const spyRunCommand = jest.spyOn(func, 'runCommand');
    await getRemoteBranches();

    expect(spyRunCommand).toHaveBeenCalledWith('git', [ 'branch', '-r', '--format=%(refname:short)' ]);
  });

  test('getRemoteBranches should parse git output correctly', async () => {
    (git.getRemoteName as jest.Mock).mockResolvedValue('origin');
    (func.runCommand as jest.Mock).mockResolvedValue('origin/main\norigin/test\n');

    const branches = await getRemoteBranches();
    expect(branches).toEqual([ 'main', 'test' ]);
  });

  test('getRemoteBranches should not throw if no remote is configured', async () => {
    (git.getRemoteName as jest.Mock).mockResolvedValue(null);
    (func.runCommand as jest.Mock).mockResolvedValue('\n');

    const branches = await getRemoteBranches();
    expect(branches).toEqual([]);
  });

});
