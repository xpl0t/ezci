import { runCommand } from '@shared/func';

/**
 * Return current git branch.
 *
 * @returns Current git branch.
 */
export async function getCurrentBranch(): Promise<string> {
  const currentBranch = await runCommand('git', [ 'branch', '--show-current' ]);
  return currentBranch.replace(/\n|\r/g, '');
}
