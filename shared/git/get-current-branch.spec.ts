import * as func from '../func';
import { getCurrentBranch } from './get-current-branch.func';

jest.mock('@shared/func');

describe('getCurrentBranch', () => {

  test('runCommand should be called', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue('test\n');
    const spyRunCommand = jest.spyOn(func, 'runCommand');
    await getCurrentBranch();

    expect(spyRunCommand).toHaveBeenCalledTimes(1);
  });

  test('runCommand should be called with correct parameters', async () => {
    (func.runCommand as jest.Mock).mockImplementation(async (cmd, args) => {
      expect(cmd).toBe('git');
      expect(args).toEqual([ 'branch', '--show-current' ]);

      return 'main\n';
    });

    await getCurrentBranch();
  });

  test('getCurrentBranch should parse git output correctly (remove newline & carriage return characters)', async () => {
    (func.runCommand as jest.Mock)
      .mockResolvedValueOnce('test')
      .mockResolvedValueOnce('test\n')
      .mockResolvedValueOnce('test\r\n')
      .mockResolvedValueOnce('\r\n\n\n\rtest\r\n');

    const results: string[] = [];
    const expected: string[] = [];

    for (let i = 0; i < 4; i++) {
      const branch = await getCurrentBranch();
      results.push(branch);
      expected.push('test');
    }

    expect(results).toEqual(expected);
  });

});
