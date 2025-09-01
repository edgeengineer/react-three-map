import 'maplibre-gl/dist/maplibre-gl.css';
import { FC, PropsWithChildren } from "react";
import Map from 'react-map-gl/maplibre';

export interface StoryMapProps extends PropsWithChildren {
  latitude: number,
  longitude: number,
  zoom?: number,
  pitch?: number,
}

/** `<Map>` styled for stories */
export const StoryMap: FC<StoryMapProps> = ({
  latitude, longitude, zoom = 13, pitch = 0, children
}) => {
  // Use a dark map style for better contrast in Storybook
  const mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        antialias
        initialViewState={{
          latitude,
          longitude,
          zoom,
          pitch,
        }}
        mapStyle={mapStyle}
      >
        {children}
      </Map>
    </div>
  );
}