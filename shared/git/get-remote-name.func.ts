import { runCommand } from '../func';

/**
 * Get the name of the configured remote, or null if no remote is configured.
 * 
 * @returns The remote name or null if no remote is configured.
 */
export async function getRemoteName(): Promise<string> {
  const name = (await runCommand('git', [ 'remote', 'show' ]))
    .replace(/\r|\n/g, '');

  return name.length <= 0 ? null : name;
}
