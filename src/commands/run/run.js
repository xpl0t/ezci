const { spawnSync } = require('child_process');
const inquirer = require('inquirer');
const { exit } = require('process');

async function runCommand(command, args) {
  const { stdout, stderr, status } = spawnSync(command, args);

  if (status !== 0) {
    stderrStr = stderr ? stderr.toString() : null;
    const commandStr = `${command} ${args.map(a => '"' + a + '"').join(' ')}`;
    throw new Error(`Command '${commandStr}' exited with code ${status}: ${stderrStr}`);
  }

  return stdout ? stdout.toString() : null;
}

async function getReleaseBranches(branchPattern) {
  const out = await runCommand('git', [ 'branch', '--format=%(refname:short)' ]);
  return out.split('\n').filter(b => b.startsWith(branchPattern));
}

async function pickReleaseBranch(branches) {
  const simplifiedBranchNames = branches.map(b => b.replace('release/', ''));

  const questions = [{
    type: 'list',
    name: 'branch',
    choices: simplifiedBranchNames,
    message: 'Which branch should be pushed?'
  }];

  return (await inquirer.prompt(questions))['branch'];
}

async function checkForVersionUpgrade(logger) {
  const questions = [{
    type: 'list',
    name: 'version',
    choices: [ 'no', 'yes' ],
    message: 'Did you update the version/are you sure to run the pipeline?'
  }];

  const res = (await inquirer.prompt(questions))['version'];
  if (res !== 'yes') {
    logger.info('Let\'s check everything first :)');
    exit(0);
  }
}

async function checkWorkingTreeClean() {
  const res = await runCommand('git', [ 'status', '-s' ]);
  
  if (res.length > 0) {
    throw new Error('Working tree not clean!');
  }
}

async function getCurrentBranch() {
  const currentBranch = await runCommand('git', [ 'branch', '--show-current' ]);
  return currentBranch.replace('\n', '');
}

async function checkoutBranch(logger, branch) {
  logger.debug(`Checking out branch "${branch}"`);
  await runCommand('git', [ 'checkout', branch ]);
}

async function updateTargetBranch(logger, currentBranch, targetBranch) {
  await checkoutBranch(logger, targetBranch);

  logger.info(`Overwriting branch ${targetBranch} with ${currentBranch}`);
  await runCommand('git', [ 'reset', '--hard', currentBranch ]);

  logger.info(`Force pushing branch ${targetBranch}`);
  await runCommand('git', [ 'push', '-f' ]);

  await checkoutBranch(logger, currentBranch);
}

exports.runAction = async ({ logger, options }) => {
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

  updateTargetBranch(logger, currentBranch, targetBranch);

  logger.info('Done :)');
};
