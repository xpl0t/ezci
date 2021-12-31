import { runCommand } from '../func';

/**
 * Checks if the working tree is clean.
 *
 * @returns true if the working tree is clean and false otherwise.
 */
export async function isWorkingTreeClean(): Promise<boolean> {
  const res = await runCommand('git', [ 'status', '-s' ]);
  return res.length > 0 ? false : true;
}
