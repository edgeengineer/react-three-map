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
      define: {
        ...config.define,
        'import.meta.env.VITE_MAPBOX_TOKEN': JSON.stringify(process.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWJhbGV4OTkiLCJhIjoiY2o1cGttZTJjMGJ5NDMycHFwY2h0amZieSJ9.fHqdZDfrCz6dEYTdnQ-hjQ'),
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          'react-three-map/maplibre': path.resolve(__dirname, '../src/maplibre.index.ts'),
          'react-three-map/mapbox': path.resolve(__dirname, '../src/mapbox.index.ts'),
          'react-three-map': path.resolve(__dirname, '../src/maplibre.index.ts')
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