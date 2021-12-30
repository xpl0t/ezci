import { runCommand } from '@shared/func';

export async function getBranches(): Promise<string[]> {
  const out = await runCommand('git', [ 'branch', '--format=%(refname:short)' ]);
  return out.split('\n');
}
