import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';

import NodeEnvironment from 'jest-environment-node';
import path from 'path';

export default class AmazingEnvironment extends NodeEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    const testPath = context.testPath;
    const testDir = path.dirname(testPath);
    const testCategory = path.basename(testDir);

    this.global.process.env.TEST_CATEGORY = testCategory;
  }

  override async setup(): Promise<void> {
    await super.setup();

    this.global.console = console;
  }
}
