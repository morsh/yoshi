import path from 'path';
import fs from 'fs-extra';
import { FlowBMModel } from './createFlowBMModel';

const generateModuleCode = ({
  moduleId,
  exportedComponents,
  methods,
  pages,
  moduleInitPath,
  localePath,
  moduleConfig,
}: FlowBMModel) => `
import { createModule } from 'yoshi-flow-bm-runtime';

createModule({
  moduleId: '${moduleId}',
  pages: [
    ${pages.map(
      ({ componentId, componentPath }) => `
      {
        componentId: '${componentId}',
        loadComponent: async () => (await import('${componentPath}')).default,
      },
    `,
    )}
  ],
  exportedComponents: [
    ${exportedComponents.map(
      ({ componentId, componentPath }) => `
      {
        componentId: '${componentId}',
        loadComponent: async () => (await import('${componentPath}')).default,
      },
    `,
    )}
  ],
  methods: [
    ${methods.map(
      ({ methodId, methodPath }) => `
      {
        methodId: '${methodId}',
        loadMethod: () => require('${methodPath}').default,
      }`,
    )}
  ], // ${JSON.stringify(methods)},
  ${moduleInitPath ? `moduleInit: require('${moduleInitPath}').default,` : ''}
  loadLocale: (locale = 'en') => import(\`${localePath}/\${locale}\`),
  config: ${JSON.stringify(moduleConfig)},
});`;

const renderModule = (model: FlowBMModel) => {
  const filePath = path.resolve(__dirname, '../tmp/module.ts');

  fs.outputFileSync(filePath, generateModuleCode(model));

  return filePath;
};

export default renderModule;
