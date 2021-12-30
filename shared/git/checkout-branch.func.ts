import { runCommand } from '@shared/func';

export async function checkoutBranch(branch: string): Promise<void> {
  await runCommand('git', [ 'checkout', branch ]);
}
