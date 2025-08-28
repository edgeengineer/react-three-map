import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../example-mapbox/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../example-maplibre/src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@chromatic-com/storybook'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config, { configType }) => {
    const { default: path } = await import('path');
    
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          'react-three-map': path.resolve(__dirname, '../src'),
          'react-three-map/maplibre': path.resolve(__dirname, '../src/maplibre'),
          'react-three-map/mapbox': path.resolve(__dirname, '../src/mapbox'),
          'react-map-gl/maplibre': 'react-map-gl/dist/esm/maplibre',
          'react-map-gl': 'react-map-gl/dist/esm/index'
        }
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include || []),
          'maplibre-gl',
          'mapbox-gl'
        ]
      }
    };
  }
};

export default config;