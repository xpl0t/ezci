import { getCurrentBranch, fetch } from '../../shared/git';
import { checkBranchChanged, checkBranchExists, checkWorkingTreeClean, updateTargetBranch } from './git';
import { checkForVersionUpgrade, pickReleaseBranches } from './queries';

export const runAction = async ({ logger, options }): Promise<void> => {
  await fetch();
  const initialBranch = await getCurrentBranch();
  const { branchPattern, yes } = options;

  const branches = options.branch == null
    ? await pickReleaseBranches(branchPattern)
    : [ options.branch ];

  if (branches.includes(initialBranch)) {
    throw new Error('Current branch = target branch!');
  }

  for (const branch of branches) {
    await checkBranchExists(branch, true);
  }

  for (const branch of branches) {
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
  }

  logger.info('Done :)');
};
