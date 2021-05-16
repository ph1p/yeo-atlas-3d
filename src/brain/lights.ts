import * as THREE from 'three';
import { IS_DEV } from '../utils/constants';

export const setupLight = (scene: THREE.Scene) => {
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(0, 350, 0);
  dirLight.lookAt(0, 0, 0);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight2.position.set(0, -350, 0);
  dirLight.lookAt(0, 0, 0);
  scene.add(dirLight2);

  const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight3.position.set(350, 0, 0);
  dirLight.lookAt(0, 0, 0);
  scene.add(dirLight3);

  const dirLight4 = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight4.position.set(-350, 0, 0);
  dirLight.lookAt(0, 0, 0);
  scene.add(dirLight4);

  const dirLight5 = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight5.position.set(0, 0, 350);
  dirLight.lookAt(0, 0, 0);
  scene.add(dirLight5);

  const dirLight6 = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight6.position.set(0, 0, -350);
  dirLight.lookAt(0, 0, 0);
  scene.add(dirLight6);

  if (IS_DEV) {
    scene.add(new THREE.DirectionalLightHelper(dirLight));
    scene.add(new THREE.DirectionalLightHelper(dirLight2));
    scene.add(new THREE.DirectionalLightHelper(dirLight3));
    scene.add(new THREE.DirectionalLightHelper(dirLight4));
    scene.add(new THREE.DirectionalLightHelper(dirLight5));
    scene.add(new THREE.DirectionalLightHelper(dirLight6));
  }
  // scene.add(new THREE.AmbientLight(0xffffff, 1));
};
