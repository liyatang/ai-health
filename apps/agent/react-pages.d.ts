declare module 'virtual:react-pages' {
  import type { RouteObject } from 'react-router-dom';

  export const pagesRoutes: RouteObject[];

  export const PagesRoutes: {
    LOGIN: '/login';
    HOME: '/home';
    DEBUG: '/debug';
  };
}
