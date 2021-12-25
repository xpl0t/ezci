const { program } = require("@caporal/core");
const { runAction } = require('./commands/run/run.js');

const bootstrap = () => {
  program
    .command('run', 'Run CI pipeline', {})
    .option('--branch-pattern, -p [branch-pattern]', 'Pattern of branches hooked to CI triggers', { default: 'release/' })
    .action(runAction);

  program.run();
};

exports.bootstrap = bootstrap;
