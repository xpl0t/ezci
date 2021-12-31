import { program } from '@caporal/core';
import { description, name, version } from '../package.json';
import { bootstrap } from './bootstrap';

jest.mock('@caporal/core', () => {
  const thisReturningFunc = function(...arg: any[]) { return this; };
  
  return {
    program: {
      name: jest.fn(thisReturningFunc),
      version: jest.fn(thisReturningFunc),
      description: jest.fn(thisReturningFunc),
      command: jest.fn(thisReturningFunc),
      option: jest.fn(thisReturningFunc),
      action: jest.fn(thisReturningFunc),
      run: jest.fn(async () => {})
    }
  };
});

describe('bootstrap', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('bootstrap should run program', async () => {
    await bootstrap();
    expect(program.run).toHaveBeenCalledTimes(1);
  });

  test('bootstrap should set cli name correctly', async () => {
    await bootstrap();
    expect(program.name).toHaveBeenCalledWith(name);
  });

  test('bootstrap should set cli version correctly', async () => {
    await bootstrap();
    expect(program.version).toHaveBeenCalledWith(version);
  });

  test('bootstrap should set cli description correctly', async () => {
    await bootstrap();
    expect(program.description).toHaveBeenCalledWith(description);
  });

  test('bootstrap should add "run" command', async () => {
    await bootstrap();
    expect(program.command).toHaveBeenCalledWith('run', 'Run CI pipeline', {});
  });

});
