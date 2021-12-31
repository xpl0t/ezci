import { runCommand } from '../func';

/**
 * Returns a list of all git branches present.
 *
 * @returns List of all branches present.
 */
export async function getBranches(): Promise<string[]> {
  const out = await runCommand('git', [ 'branch', '--format=%(refname:short)' ]);
  return out.split('\n');
}
