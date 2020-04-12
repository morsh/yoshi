import { BusinessManagerModule } from '@wix/business-manager-api';
import { IBMModuleParams } from 'yoshi-flow-bm-runtime';

export default function init(
  this: any,
  module: BusinessManagerModule,
  moduleParams: IBMModuleParams,
) {
  console.log('🤖 MODULE INITIALIZING 🤖');
  console.log('Module Params:', moduleParams);

  this.setState({
    todos: [
      { id: '0', text: 'Go to work', done: true },
      { id: '1', text: 'Go home' },
      { id: '2', text: 'Sleep' },
    ],
  });

  // module.registerPageComponent(...);
}
