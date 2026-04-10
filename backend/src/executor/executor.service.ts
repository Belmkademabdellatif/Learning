import { Injectable } from '@nestjs/common';
import * as Dockerode from 'dockerode';
import { ProgrammingLanguage } from '@prisma/client';

interface TestCase {
  input: any;
  expected: any;
  description: string;
  isHidden: boolean;
}

interface ExecutionResult {
  allPassed: boolean;
  passed: number;
  failed: number;
  total: number;
  totalExecutionTime: number;
  details: Array<{
    testId: number;
    passed: boolean;
    executionTime: number;
    input: any;
    expected: any;
    actual: any;
    error?: string;
  }>;
}

@Injectable()
export class ExecutorService {
  private docker: Dockerode;
  private readonly MAX_EXECUTION_TIME = 10000; // 10 seconds
  private readonly MAX_MEMORY = '256m';

  constructor() {
    this.docker = new Dockerode();
  }

  async executeCode(
    code: string,
    language: ProgrammingLanguage,
    testCases: TestCase[],
  ): Promise<ExecutionResult> {
    const results: ExecutionResult = {
      allPassed: true,
      passed: 0,
      failed: 0,
      total: testCases.length,
      totalExecutionTime: 0,
      details: [],
    };

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();

      try {
        const output = await this.runInDocker(code, language, testCase.input);
        const executionTime = Date.now() - startTime;
        results.totalExecutionTime += executionTime;

        const passed = this.compareOutput(output, testCase.expected);

        if (passed) {
          results.passed++;
        } else {
          results.failed++;
          results.allPassed = false;
        }

        results.details.push({
          testId: i + 1,
          passed,
          executionTime,
          input: testCase.input,
          expected: testCase.expected,
          actual: output,
        });
      } catch (error) {
        results.failed++;
        results.allPassed = false;
        results.totalExecutionTime += Date.now() - startTime;

        results.details.push({
          testId: i + 1,
          passed: false,
          executionTime: Date.now() - startTime,
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          error: error.message,
        });
      }
    }

    return results;
  }

  private async runInDocker(
    code: string,
    language: ProgrammingLanguage,
    input: any,
  ): Promise<any> {
    const { image, command } = this.getDockerConfig(language);

    // Create container
    const container = await this.docker.createContainer({
      Image: image,
      Cmd: command,
      Tty: false,
      HostConfig: {
        Memory: this.parseMemory(this.MAX_MEMORY),
        NetworkMode: 'none', // No network access
        AutoRemove: true,
      },
      Env: [`CODE=${Buffer.from(code).toString('base64')}`, `INPUT=${JSON.stringify(input)}`],
    });

    try {
      // Start container
      await container.start();

      // Wait for execution with timeout
      const result = await Promise.race([
        container.wait(),
        this.timeout(this.MAX_EXECUTION_TIME),
      ]);

      // Get logs
      const logs = await container.logs({
        stdout: true,
        stderr: true,
      });

      // Parse output
      return this.parseOutput(logs.toString());
    } catch (error) {
      await container.stop().catch(() => {});
      throw error;
    }
  }

  private getDockerConfig(language: ProgrammingLanguage): { image: string; command: string[] } {
    const configs = {
      [ProgrammingLanguage.JAVASCRIPT]: {
        image: 'node:18-alpine',
        command: ['node', '-e', 'eval(Buffer.from(process.env.CODE, "base64").toString())'],
      },
      [ProgrammingLanguage.PYTHON]: {
        image: 'python:3.11-alpine',
        command: ['python', '-c', 'import os, base64; exec(base64.b64decode(os.environ["CODE"]))'],
      },
      [ProgrammingLanguage.TYPESCRIPT]: {
        image: 'node:22-alpine',
        command: ['sh', '-c', 'echo "$CODE" | base64 -d > /tmp/solution.ts && node --experimental-strip-types /tmp/solution.ts'],
      },
    };

    return configs[language] || configs[ProgrammingLanguage.JAVASCRIPT];
  }

  private parseMemory(memory: string): number {
    const value = parseInt(memory);
    const unit = memory.replace(value.toString(), '').toLowerCase();

    const multipliers = {
      b: 1,
      k: 1024,
      m: 1024 * 1024,
      g: 1024 * 1024 * 1024,
    };

    return value * (multipliers[unit] || 1);
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), ms);
    });
  }

  private parseOutput(output: string): any {
    try {
      const cleaned = output.trim();
      return JSON.parse(cleaned);
    } catch {
      return output.trim();
    }
  }

  private compareOutput(actual: any, expected: any): boolean {
    if (typeof actual === 'object' && typeof expected === 'object') {
      return JSON.stringify(actual) === JSON.stringify(expected);
    }
    return actual === expected;
  }
}
