const fs = require('fs');
const chalk = require('chalk');
const globby = require('globby');
const { envs } = require('./constants');
const globs = require('yoshi-config/globs');

const modulePathIgnorePatterns = ['<rootDir>/dist/', '<rootDir>/target/'];
module.exports = {
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
  projects: [
    ...[
      {
        displayName: 'spec',
        testEnvironment: 'jsdom',
        testURL: 'http://localhost',
        testMatch: [`<rootDir>/${globs.unitTests}`],
        setupFiles: [require.resolve('regenerator-runtime/runtime')],
      },
      {
        displayName: 'e2e',
        testEnvironment: require.resolve('jest-environment-yoshi-puppeteer'),
        testMatch: [`<rootDir>/${globs.e2eTests}`],
        setupFiles: [require.resolve('regenerator-runtime/runtime')],
        globalSetup: require.resolve(
          'jest-environment-yoshi-puppeteer/globalSetup',
        ),
        globalTeardown: require.resolve(
          'jest-environment-yoshi-puppeteer/globalTeardown',
        ),
      },
    ]
      .filter(({ displayName }) => {
        if (envs) {
          return envs.includes(displayName);
        }

        return true;
      })
      .map(project => {
        // We recommend projects use the `__tests__` directory But we support `test`
        // too
        const setupFilePaths = globby.sync(
          `(__tests__|test)/${project.displayName}-setup.(ts|js){,x}`,
        );

        const [setupTestsPath] = setupFilePaths;

        // There should only be 1 test file, throw an error if more than exists
        if (setupFilePaths.length > 1) {
          console.log();
          console.log(chalk.red('Multiple setup files were detected:'));
          console.log();
          setupFilePaths.forEach(setupFilePath => {
            console.log(chalk.red(` > ${setupFilePath}`));
          });
          console.log();
          console.log(
            chalk.red(
              `We recommend removing one of them. Currently using ${chalk.bold(
                setupTestsPath,
              )}.`,
            ),
          );
          console.log();
        }

        const setupTestsFile =
          setupTestsPath && fs.existsSync(setupTestsPath)
            ? `<rootDir>/${setupTestsPath}`
            : undefined;

        const setupFilesAfterEnv = [
          // Use longer default test timeout for e2e tests
          project.displayName === 'e2e' && require.resolve('./setup/e2e'),
          // Load project's setup file if it exists
          setupTestsFile,
        ].filter(Boolean);

        return {
          ...project,

          modulePathIgnorePatterns,

          transformIgnorePatterns: [
            '/node_modules/(?!(.*?\\.st\\.css$))',
            // Locally `babel-preset-yoshi` is symlinked, which causes jest to try and run babel on it.
            // See here for more details: https://github.com/facebook/jest/blob/6af2f677e5c48f71f526d4be82d29079c1cdb658/packages/jest-core/src/runGlobalHook.js#L61
            '/babel-preset-yoshi/',
          ],

          transform: {
            '^.+\\.jsx?$': require.resolve('./transforms/babel'),
            '^.+\\.tsx?$': require.resolve('ts-jest'),
            '\\.st.css?$': require.resolve('@stylable/jest'),
            '\\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|otf|eot|wav|mp3|html|md)$': require.resolve(
              './transforms/file',
            ),
          },

          moduleNameMapper: {
            '^(?!.+\\.st\\.css$)^.+\\.(?:sass|s?css|less)$': require.resolve(
              'identity-obj-proxy',
            ),
          },

          setupFilesAfterEnv,
        };
      }),
    // workaround for https://github.com/facebook/jest/issues/5866
    {
      displayName: 'dummy',
      testMatch: ['dummy'],
      modulePathIgnorePatterns,
    },
  ],
};
