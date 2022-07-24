import { getCurrentBranch, fetch } from '../../shared/git';
import { checkBranchChanged, checkBranchExists, checkWorkingTreeClean, updateTargetBranch } from './git';
import { checkForVersionUpgrade, pickReleaseBranch } from './queries';

export const runAction = async ({ logger, options }): Promise<void> => {
  await fetch();
  const initialBranch = await getCurrentBranch();
  const { branchPattern, yes } = options;
  let { branch } = options;

  if (branch == null) {
    branch = await pickReleaseBranch(branchPattern);
  }

  if (branch === initialBranch) {
    throw new Error('Current branch = target branch!');
  }

  await checkBranchExists(branch);

  if (!yes) {
    await checkForVersionUpgrade(logger, initialBranch, branch);
  }

  await checkWorkingTreeClean();

  logger.debug(`${initialBranch} ➔ ${branch}`);

  try {
    await updateTargetBranch(logger, initialBranch, branch);
  } catch (error) {
    checkBranchChanged(logger, initialBranch);
    throw error;
  }
  
  logger.info('Done :)');
};
