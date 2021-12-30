import { spawnSync } from 'child_process';

export async function runCommand(command: string, args?: string[]): Promise<string> {
  const { stdout, stderr, status } = spawnSync(command, args);

  if (status !== 0) {
    const stderrStr = stderr ? stderr.toString() : null;
    const commandStr = `${command} ${args.map(a => '"' + a + '"').join(' ')}`;
    throw new Error(`Command '${commandStr}' exited with code ${status}: ${stderrStr}`);
  }

  return stdout ? stdout.toString() : null;
}
