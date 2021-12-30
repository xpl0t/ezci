import { runCommand } from '@shared/func';

export async function isWorkingTreeClean(): Promise<boolean> {
  const res = await runCommand('git', [ 'status', '-s' ]);
  return res.length > 0 ? false : true;
}