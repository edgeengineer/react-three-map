import type { Map } from 'mapbox-gl';
import { useMap as useMapGeneric } from './api/use-map';

export * from './api';
export * from './mapbox/canvas';
export { BlenderView } from './components/BlenderView';

export const useMap = useMapGeneric<Map>;
