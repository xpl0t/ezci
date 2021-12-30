import * as childProcess from 'child_process';
import { spawnSync } from 'child_process';
import { runCommand } from './run-command.func';

jest.mock('child_process');

describe('runCommand', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('spawnSync is called', async () => {
    (spawnSync as jest.Mock).mockReturnValue({ stdout: Buffer.from('test'), status: 0 });
    const spySpawnSync = jest.spyOn(childProcess, 'spawnSync');
    await runCommand('ls', []);
    expect(spySpawnSync).toHaveBeenCalledTimes(1);
  });

  test('spawnSync is called with the right parameters', async () => {
    (spawnSync as jest.Mock).mockImplementation((cmd, args) => {
      expect(cmd).toBe('ls');
      expect(args).toEqual([ '--help', '-v' ]);

      return { stdout: 'commandOut', status: 0 };
    });

    await runCommand('ls', [ '--help', '-v' ]);
  });

  test('runCommand returns the stdout as string', async () => {
    (spawnSync as jest.Mock).mockReturnValue({ stdout: Buffer.from('test'), status: 0 });
    const out = await runCommand('ls', []);
    expect(out).toBe('test');
  });

  test('runCommand return null on stdout == undefined|null', async () => {
    (spawnSync as jest.Mock).mockReturnValue({ status: 0 });
    let out = await runCommand('ls', []);
    expect(out).toBeNull();

    (spawnSync as jest.Mock).mockReturnValue({ stdout: null, status: 0 });
    out = await runCommand('ls', []);
    expect(out).toBeNull();
  });

  test('runCommand correctly converts utf8 stdout -> utf16 javascript string', async () => {
    const unicodeStr = 'ü²³¼³¼½½@µ😀😁ýƝɚϧ𓱩𖽢';
    (spawnSync as jest.Mock).mockReturnValue({ stdout: Buffer.from(unicodeStr), status: 0 });
    let out = await runCommand('ls', []);
    expect(out).toBe(unicodeStr);
  });

  test('runCommand throws error if command exits with non success exit code (exitCode != 0)', async () => {
    const errMsg = 'errmsg123';
    const status = 1;

    (spawnSync as jest.Mock).mockReturnValue({ stderr: Buffer.from(errMsg), status });

    await expect(runCommand('ls', [])).rejects.toThrowError(errMsg);
  });

  test('runCommand can be called without args', async () => {
    (spawnSync as jest.Mock).mockImplementation((cmd, args) => {
      expect(cmd).toBe('ls');
      expect(args).toBeUndefined();

      return { stdout: 'commandOut', status: 0 };
    });

    await runCommand('ls');
  });

});
