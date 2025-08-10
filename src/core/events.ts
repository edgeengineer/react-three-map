import { Canvas, events as fiberEvents } from "@react-three/fiber";
import { Matrix4, Vector3 } from "three";

/** projection * view matrix inverted */
const projViewInv = new Matrix4()
const rayOrigin = new Vector3()
const rayDirection = new Vector3()

type Events = Parameters<typeof Canvas>[0]['events'];

export const events: Events = (store) => {
  const originalEvents = fiberEvents(store);
  return {
    ...originalEvents,
    connect: target => {
      if (!originalEvents.connect) return;
      originalEvents.connect(target.parentElement!);  // eslint-disable-line @typescript-eslint/no-non-null-assertion
    },
    compute: (event, state) => {

      state.pointer.x = (event.offsetX / state.size.width) * 2 - 1;
      state.pointer.y = 1 - (event.offsetY / state.size.height) * 2;

      if (state.camera.userData.projByViewInv) {
        projViewInv.fromArray(state.camera.userData.projByViewInv);
        
        // Custom raycasting for map projection
        // Ray origin is the camera position (unprojected from NDC origin)
        rayOrigin.set(0, 0, -1).applyMatrix4(projViewInv);
        
        // Ray passes through the pointer position on the far plane
        rayDirection
          .set(state.pointer.x, state.pointer.y, 1)
          .applyMatrix4(projViewInv)
          .sub(rayOrigin)
          .normalize();
        
        state.raycaster.camera = state.camera;
        state.raycaster.ray.origin.copy(rayOrigin);
        state.raycaster.ray.direction.copy(rayDirection);
      } else {
        // Fallback to default raycaster setup
        state.raycaster.setFromCamera(state.pointer, state.camera);
      }

    },
  };
};