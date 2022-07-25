import * as func from '../func';
import { fetch } from './fetch.func';

jest.mock('../func');

describe('checkoutBranch', () => {

  test('runCommand should be called', async () => {
    (func.runCommand as jest.Mock).mockResolvedValue(`git fetch output here....`);
    const spyRunCommand = jest.spyOn(func, 'runCommand');
    await fetch()

    expect(spyRunCommand).toHaveBeenCalledTimes(1);
    expect(spyRunCommand).toHaveBeenCalledWith('git', [ 'fetch' ]);
  });

});
