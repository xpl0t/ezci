import { runCommand } from '../func';
import { getRemoteName } from './get-remote-name.func';
/**
 * Returns a list of all git remote branches.
 *
 * @returns List of all remote branches.
 */
export async function getRemoteBranches(): Promise<string[]> {
  const originName = await getRemoteName();
  const out = await runCommand('git', [ 'branch', '-r', '--format=%(refname:short)' ]);
  return out
    .split('\n')
    .filter(b => b.length > 0)
    .map(b => originName != null ? b.replace(`${originName}/`, '') : b);
}
