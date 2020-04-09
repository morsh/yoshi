import {
  BusinessManagerModule,
  ModuleId,
  PageComponentId,
  registerModule,
  notifyViewStartLoading,
  registerPageComponentMonitors,
} from '@wix/business-manager-api';
import Experiments from '@wix/wix-experiments';
import { BrowserClient } from '@sentry/browser';
import { ModuleRegistry, ReactLoadableComponent } from 'react-module-container';
import { ComponentType } from 'react';
import withBM from './withBM';
import { IBMModuleParams } from './hooks/ModuleProvider';

interface ModuleOptions {
  moduleId: string;
  pages: Array<{
    componentId: string;
    loadComponent(): Promise<ComponentType<any>>;
  }>;
  exportedComponents: Array<{
    componentId: string;
    loadComponent(): Promise<ComponentType<any>>;
  }>;
  methods: Array<{
    methodId: string;
    loadMethod(): (...args: Array<any>) => any;
  }>;
  loadLocale: (locale?: string) => Record<string, string>;
  moduleInit: (
    this: any,
    _module: BusinessManagerModule,
    _moduleParams: IBMModuleParams,
  ) => void;
  config?: any;
}

export default function createModule({
  moduleId,
  pages,
  exportedComponents,
  methods,
  loadLocale,
  moduleInit,
  config: { experimentsScopes = [] } = {},
}: ModuleOptions) {
  const sentryClient = new BrowserClient({
    dsn: 'https://123456@sentry.ioo/1337', // generate sentry dsn for groupId & artifactId
  });

  class Module extends BusinessManagerModule {
    state: any = {};

    setState = (newState: any) => (this.state = newState);

    constructor(moduleId: ModuleId) {
      super(moduleId);

      pages.forEach(({ componentId, loadComponent }) => {
        registerPageComponentMonitors(componentId as PageComponentId, {
          sentryClient,
        });

        console.log(`Module: ${moduleId}, Component: ${componentId}`);

        this.registerPageComponent(
          componentId,
          ReactLoadableComponent(componentId, async () => {
            const experiments = new Experiments();

            experimentsScopes.forEach((scope: string) =>
              experiments.load(scope),
            );

            notifyViewStartLoading(componentId);

            // TODO: Do this the react-loadable way
            const [Component, translations] = await Promise.all([
              loadComponent(),
              loadLocale(
                ((this as any)._moduleParams as IBMModuleParams).locale,
              ),
              experiments.ready(),
            ]);

            return {
              default: withBM(
                componentId,
                experiments.all(),
                translations,
                sentryClient,
              )(Component),
            };
          }),
        );
      });

      exportedComponents.forEach(({ componentId, loadComponent }) => {
        this.registerComponentWithModuleParams(
          componentId,
          ReactLoadableComponent(componentId, async () => {
            const experiments = new Experiments();

            experimentsScopes.forEach((scope: string) =>
              experiments.load(scope),
            );

            // TODO: Do this the react-loadable way
            const [Component, translations] = await Promise.all([
              loadComponent(),
              loadLocale(
                ((this as any)._moduleParams as IBMModuleParams).locale,
              ),
              experiments.ready(),
            ]);

            return {
              default: withBM(
                componentId,
                experiments.all(),
                translations,
                sentryClient,
              )(Component),
            };
          }),
        );
      });

      methods
        .map(({ methodId, loadMethod }) => ({
          methodId,
          method: loadMethod(),
        }))
        .forEach(({ methodId, method }) => {
          ModuleRegistry.registerMethod(methodId, () => method.bind(this));
        });
    }

    init(moduleParams: IBMModuleParams) {
      if (moduleInit) {
        moduleInit.call(this, this, moduleParams);
      }
    }
  }

  registerModule(moduleId as ModuleId, Module);
}
