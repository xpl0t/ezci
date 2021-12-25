import { spawnSync } from 'child_process';
import { prompt } from 'inquirer';
import { exit } from 'process';

async function runCommand(command, args): Promise<string> {
  const { stdout, stderr, status } = spawnSync(command, args);

  if (status !== 0) {
    const stderrStr = stderr ? stderr.toString() : null;
    const commandStr = `${command} ${args.map(a => '"' + a + '"').join(' ')}`;
    throw new Error(`Command '${commandStr}' exited with code ${status}: ${stderrStr}`);
  }

  return stdout ? stdout.toString() : null;
}

async function getReleaseBranches(branchPattern): Promise<string[]> {
  const out = await runCommand('git', [ 'branch', '--format=%(refname:short)' ]);
  return out.split('\n').filter(b => b.startsWith(branchPattern));
}

async function pickReleaseBranch(branches): Promise<string> {
  const questions = [{
    type: 'list',
    name: 'branch',
    choices: branches,
    message: 'Which branch should be pushed?'
  }];

  return (await prompt(questions))['branch'];
}

async function checkForVersionUpgrade(logger): Promise<void> {
  const questions = [{
    type: 'list',
    name: 'version',
    choices: [ 'no', 'yes' ],
    message: 'Did you update the version/are you sure to run the pipeline?'
  }];

  const res = (await prompt(questions))['version'];
  if (res !== 'yes') {
    logger.info('Let\'s check everything first :)');
    exit(0);
  }
}

async function checkWorkingTreeClean(): Promise<void> {
  const res = await runCommand('git', [ 'status', '-s' ]);
  
  if (res.length > 0) {
    throw new Error('Working tree not clean!');
  }
}

async function getCurrentBranch(): Promise<string> {
  const currentBranch = await runCommand('git', [ 'branch', '--show-current' ]);
  return currentBranch.replace('\n', '');
}

async function checkoutBranch(logger, branch): Promise<void> {
  logger.debug(`Checking out branch "${branch}"`);
  await runCommand('git', [ 'checkout', branch ]);
}

async function updateTargetBranch(logger, currentBranch, targetBranch): Promise<void> {
  await checkoutBranch(logger, targetBranch);

  logger.info(`Overwriting branch "${targetBranch}" with "${currentBranch}"`);
  await runCommand('git', [ 'reset', '--hard', currentBranch ]);

  logger.info(`Force pushing branch ${targetBranch}`);
  await runCommand('git', [ 'push', '-f' ]);

  await checkoutBranch(logger, currentBranch);
}

export const runAction = async ({ logger, options }): Promise<void> => {
  const { branchPattern } = options;

  const branches = await getReleaseBranches(branchPattern);
  if (branches.length === 0) {
    throw new Error('No release branches!');
  }

  const targetBranch = await pickReleaseBranch(branches);
  const currentBranch = await getCurrentBranch();

  if (targetBranch === currentBranch) {
    throw new Error('Current branch = target branch!');
  }

  await checkForVersionUpgrade(logger);
  await checkWorkingTreeClean();

  logger.debug(`Current branch: ${currentBranch}`);
  logger.debug(`Target branch: ${targetBranch}`);

  await updateTargetBranch(logger, currentBranch, targetBranch);

  logger.info('Done :)');
};
