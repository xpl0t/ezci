import { runCommand } from '../func';

/**
 * Perform git fetch.
 */
export async function fetch(): Promise<void> {
  await runCommand('git', [ 'fetch' ]);
}
