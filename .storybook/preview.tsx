import type { Preview } from '@storybook/react';
import React from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token if available
if (typeof window !== 'undefined' && import.meta.env.STORYBOOK_MAPBOX_TOKEN) {
  (window as any).MAPBOX_TOKEN = import.meta.env.STORYBOOK_MAPBOX_TOKEN;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;