import { runCommand } from '@shared/func';

export async function getCurrentBranch(): Promise<string> {
  const currentBranch = await runCommand('git', [ 'branch', '--show-current' ]);
  return currentBranch.replace('\n', '');
}
