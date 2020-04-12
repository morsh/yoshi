import React, { FC, useEffect } from 'react';
import { notifyViewFinishedLoading } from '@wix/business-manager-api';
import {
  useFedops,
  useExperiments,
  useTranslate,
  useSentry,
} from 'yoshi-flow-bm-runtime';
import TodoList from '../TodoList';

const Todo: FC = () => {
  const fedops = useFedops();
  const Sentry = useSentry();
  const { enabled } = useExperiments();
  const t = useTranslate();

  useEffect(() => {
    fedops.appLoaded();
    notifyViewFinishedLoading('{%projectName%}.pages.index');
    console.log(Sentry);
  }, []);

  return (
    <div>
      <h1>{t('app.title')}</h1>
      A/B Test Result: {enabled('specs.yoshi.IsNew') ? 'A' : 'B'}
      <TodoList />
    </div>
  );
};

export default Todo;
