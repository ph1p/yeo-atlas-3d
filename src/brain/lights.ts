import * as THREE from 'three';
import { IS_DEV } from '../utils/constants';

export const setupLight = (scene: THREE.Scene) => {
  for (const position of [
    new THREE.Vector3(0, 350, 0),
    new THREE.Vector3(0, -350, 0),
    new THREE.Vector3(350, 0, 0),
    new THREE.Vector3(-350, 0, 0),
    new THREE.Vector3(0, 0, 350),
    new THREE.Vector3(0, 0, -350),
  ]) {
    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.copy(position);
    light.lookAt(0, 0, 0);
    scene.add(light);
    if (IS_DEV) {
      scene.add(new THREE.DirectionalLightHelper(light));
    }
  }
  // scene.add(new THREE.AmbientLight(0xffffff, 1));
};
