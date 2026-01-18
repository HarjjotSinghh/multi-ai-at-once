import Table, { TableConstructorOptions } from 'cli-table3';
import { AIResponse } from '@multi-ai/core';
import chalk from 'chalk';

export interface TableOptions {
  includeTimestamp?: boolean;
  includeResponseTime?: boolean;
  maxContentLength?: number;
}

/**
 * Display AI responses in a formatted table
 */
export function displayTable(responses: AIResponse[], options: TableOptions = {}): void {
  const {
    includeTimestamp = true,
    includeResponseTime = true,
    maxContentLength = 500,
  } = options;

  // Filter out failed responses
  const successful = responses.filter((r) => r.status === 'success');
  const failed = responses.filter((r) => r.status !== 'success');

  // Create table
  const tableConfig: TableConstructorOptions = {
    head: [
      chalk.cyan('Service'),
      chalk.cyan('Response'),
      ...(includeResponseTime ? [chalk.cyan('Time')] : []),
      ...(includeTimestamp ? [chalk.cyan('Timestamp')] : []),
    ],
    wordWrap: true,
    wrapOnWordBoundary: false,
  };

  // Set column widths
  const baseWidths: number[] = [15, 60];
  if (includeResponseTime) baseWidths.push(10);
  if (includeTimestamp) baseWidths.push(20);
  tableConfig.colWidths = baseWidths;

  const table = new Table(tableConfig);

  // Add successful responses
  for (const response of successful) {
    let content = response.content;
    if (maxContentLength > 0 && content.length > maxContentLength) {
      content = content.substring(0, maxContentLength) + '...';
    }
    content = content.replace(/\n/g, ' ');

    const row: (string | number)[] = [
      chalk.green(response.serviceName),
      content,
    ];

    if (includeResponseTime) {
      row.push(`${response.responseTime}ms`);
    }

    if (includeTimestamp) {
      row.push(response.timestamp.toLocaleTimeString());
    }

    table.push(row);
  }

  // Add failed responses
  for (const response of failed) {
    const errorMsg = chalk.red(`${response.status}: ${response.error || 'Unknown error'}`);

    const row: (string | number)[] = [
      chalk.red(response.serviceName),
      errorMsg,
    ];

    if (includeResponseTime) {
      row.push(`${response.responseTime}ms`);
    }

    if (includeTimestamp) {
      row.push(response.timestamp.toLocaleTimeString());
    }

    table.push(row);
  }

  console.log(table.toString());
}

/**
 * Display responses as JSON
 */
export function displayJSON(responses: AIResponse[]): void {
  console.log(JSON.stringify(responses, null, 2));
}

/**
 * Display responses as Markdown
 */
export function displayMarkdown(responses: AIResponse[], options: TableOptions = {}): void {
  const { includeResponseTime = true } = options;

  for (const response of responses) {
    const statusIcon = response.status === 'success' ? '✓' : '✗';
    const statusColor = response.status === 'success' ? 'green' : 'red';

    console.log(`\n## ${statusIcon} ${response.serviceName}\n`);
    console.log(`**Status:** \`${response.status}\`\n`);

    if (response.error) {
      console.log(`**Error:** \`${response.error}\`\n`);
    }

    if (includeResponseTime) {
      console.log(`**Response Time:** ${response.responseTime}ms\n`);
    }

    console.log('**Response:**\n');
    console.log('```\n');
    console.log(response.content || 'No response');
    console.log('\n```\n');
  }
}
