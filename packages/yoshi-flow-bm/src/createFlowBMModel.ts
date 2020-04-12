import path from 'path';
import globby from 'globby';
import { getProjectArtifactId } from 'yoshi-helpers/build/utils';

export interface ExportedComponentModel {
  componentId: string;
  componentPath: string;
}
export interface PageModel extends ExportedComponentModel {
  route: string;
}
export interface MethodModel {
  methodId: string;
  methodPath: string;
}

export interface FlowBMModel {
  moduleId: string;
  pages: Array<PageModel>;
  exportedComponents: Array<ExportedComponentModel>;
  methods: Array<MethodModel>;
  moduleInitPath?: string;
  localePath: string;
  moduleConfig: any;
}

const exts = '{js,jsx,ts,tsx}';
const pagesPattern = `src/pages/**/*.${exts}`;
const componentsPattern = `src/exported-components/**/*.${exts}`;
const methodsPattern = `src/methods/**/*.${exts}`;
const moduleInitPattern = `src/moduleInit.${exts}`;
const translationsPattern = 'translations';

export default function createFlowBMModel(cwd = process.cwd()): FlowBMModel {
  const globFiles = (pattern: string) =>
    globby.sync(pattern, { cwd, absolute: true, onlyFiles: true });

  const globDirs = (pattern: string) =>
    globby.sync(pattern, {
      cwd,
      absolute: true,
      onlyDirectories: true,
      expandDirectories: false,
    });

  const moduleId = getProjectArtifactId(cwd)!;

  const pages = globFiles(pagesPattern).map(pagePath => ({
    componentId: `${moduleId}.pages.${path.parse(pagePath).name}`,
    componentPath: pagePath,
    route: '', // TODO: Deferred to the "render ERB" feature, unnecessary until then
  }));

  const exportedComponents = globFiles(componentsPattern).map(
    componentPath => ({
      componentId: `${moduleId}.exported-components.${
        path.parse(componentPath).name
      }`,
      componentPath,
    }),
  );

  const methods = globFiles(methodsPattern).map(methodPath => ({
    methodId: `${moduleId}.methods.${path.parse(methodPath).name}`,
    methodPath,
  }));

  const [moduleInitPath] = globFiles(moduleInitPattern);
  const [localePath] = globDirs(translationsPattern);

  return {
    moduleId,
    pages,
    exportedComponents,
    methods,
    localePath,
    moduleConfig: {},
    moduleInitPath,
  };
}
