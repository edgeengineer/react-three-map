import MapboxGl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FC, PropsWithChildren } from "react";
import Map from 'react-map-gl/mapbox';

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
  // Set the Mapbox token
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWJhbGV4OTkiLCJhIjoiY2o1cGttZTJjMGJ5NDMycHFwY2h0amZieSJ9.fHqdZDfrCz6dEYTdnQ-hjQ';
  MapboxGl.accessToken = mapboxToken;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        mapboxAccessToken={mapboxToken}
        antialias
        initialViewState={{
          latitude,
          longitude,
          zoom,
          pitch,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        {children}
      </Map>
    </div>
  );
}