import * as func from '../func';
import { getBranches } from './get-branches.func';

jest.mock('../func');

describe('getBranches', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('runCommand should be called', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue('main\ntest');
    const spyRunCommand = jest.spyOn(func, 'runCommand');
    await getBranches();

    expect(spyRunCommand).toHaveBeenCalledTimes(1);
  });

  test('runCommand should be called with correct parameters', async () => {
    (func.runCommand as jest.Mock).mockImplementation(async (cmd, args) => {
      expect(cmd).toBe('git');
      expect(args).toEqual([ 'branch', '--format=%(refname:short)' ]);

      return 'main\ntest';
    });

    await getBranches();
  });

  test('getBranches should parse git output correctly', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue('main\ntest');

    const branches = await getBranches();
    expect(branches).toEqual([ 'main', 'test' ]);
  });

});
