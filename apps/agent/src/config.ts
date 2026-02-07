const isDev = process.env.NODE_ENV === 'development';

const globalConfig = {
  basename: isDev ? '/dev-only' : '/agent',
  name: 'AI Health',
};

const localStorageKey = {};

export { globalConfig, localStorageKey };
