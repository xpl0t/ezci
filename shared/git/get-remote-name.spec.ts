import * as func from '../func';
import { getRemoteName } from './get-remote-name.func';

jest.mock('../func');

describe('checkoutBranch', () => {

  test('runCommand should be called', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue(`origin\n`);
    const spyRunCommand = jest.spyOn(func, 'runCommand');
    await getRemoteName()

    expect(spyRunCommand).toHaveBeenCalledTimes(1);
    expect(spyRunCommand).toHaveBeenCalledWith('git', [ 'remote', 'show' ]);
  });

  it.each([ 'origin', 'origin\n', 'origin\r\n' ])(
    'runCommand should return remote name',
    async (gitOut: string) => {
      (func.runCommand as jest.Mock).mockResolvedValue(gitOut);
      const actual = await getRemoteName()

      expect(actual).toBe('origin');
    }
  );

  it.each([ '', '\n', '\r\n' ])(
    'runCommand should return null if no remote is configured',
    async (gitOut: string) => {
      (func.runCommand as jest.Mock).mockResolvedValue(gitOut);
      const actual = await getRemoteName()

      expect(actual).toBeNull();
    }
  );

});
