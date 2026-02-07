import { useGlobalStore } from '@/stores/global';
import { PageLayout } from '@fe-free/core';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PagesRoutes } from 'virtual:react-pages';

const AppLayout = () => {
  return (
    <PageLayout direction="vertical" className="app" childrenClassName="bg-white">
      <Outlet />
    </PageLayout>
  );
};

function PrepareAppLayout() {
  const init = useGlobalStore((state) => state.init);
  const doInit = useGlobalStore((state) => state.doInit);

  useEffect(() => {
    doInit(true);
  }, []);

  if (!init) {
    return null;
  }

  return <AppLayout />;
}

function WrapAppLayout() {
  const location = useLocation();

  if (
    location.pathname.startsWith(PagesRoutes.DEBUG) ||
    location.pathname.startsWith(PagesRoutes.LOGIN)
  ) {
    return <Outlet />;
  }

  return <PrepareAppLayout />;
}

export default WrapAppLayout;
