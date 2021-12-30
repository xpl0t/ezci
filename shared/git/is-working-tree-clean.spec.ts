import * as func from '../func';
import { isWorkingTreeClean } from './is-working-tree-clean.func';

jest.mock('@shared/func');

describe('isWorkingTreeClean', () => {

  test('runCommand should be called', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue('test\n');
    const spyRunCommand = jest.spyOn(func, 'runCommand');
    await isWorkingTreeClean();

    expect(spyRunCommand).toHaveBeenCalledTimes(1);
  });

  test('runCommand should be called with correct parameters', async () => {
    (func.runCommand as jest.Mock).mockImplementation(async (cmd, args) => {
      expect(cmd).toBe('git');
      expect(args).toEqual([ 'status', '-s' ]);

      return 'changes...';
    });

    await isWorkingTreeClean();
  });

  test('isWorkingTreeClean should return false when git status output is present', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue('changes...');

    const res = await isWorkingTreeClean();
    expect(res).toBe(false);
  });

  test('isWorkingTreeClean should return true when git status output is not present', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue('');

    const res = await isWorkingTreeClean();
    expect(res).toBe(true);
  });

});
