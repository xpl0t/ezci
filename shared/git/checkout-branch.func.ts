import { runCommand } from '@shared/func';
import { getCurrentBranch } from './get-current-branch.func';

/**
 * Checkout branch and check if the checkout succeeded.
 *
 * @param branch Branch to switch to.
 * @returns Branch switched to.
 */
export async function checkoutBranch(branch: string): Promise<string> {
  await runCommand('git', [ 'checkout', branch ]);

  const currentBranch = await getCurrentBranch();
  if (currentBranch !== branch) {
    throw new Error(`Checkout failed! Target branch: "${branch}", current branch: "${currentBranch}"`)
  }

  return currentBranch;
}
