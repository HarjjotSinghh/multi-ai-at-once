#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createPromptCommand } from './commands/prompt';
import { createConfigCommand } from './commands/config';
import { createListCommand } from './commands/list';

const program = new Command();

program
  .name('multi-ai')
  .description('Send prompts to multiple AI services simultaneously')
  .version('1.0.0');

// Add commands
program.addCommand(createPromptCommand());
program.addCommand(createConfigCommand());
program.addCommand(createListCommand());

// Default action - show help
program.action(() => {
  console.log('');
  console.log(chalk.cyan.bold('Multi-AI Prompt Platform'));
  console.log('');
  console.log('Send the same prompt to multiple AI services (ChatGPT, Claude, Gemini, etc.) simultaneously.');
  console.log('');
  console.log(chalk.yellow('Examples:'));
  console.log('  multi-ai prompt "What is 2+2?"');
  console.log('  multi-ai prompt "Explain quantum computing" -s chatgpt,claude');
  console.log('  multi-ai prompt "Hello" --format json');
  console.log('  multi-ai list');
  console.log('  multi-ai config list');
  console.log('');
  program.help();
});

program.parse();
