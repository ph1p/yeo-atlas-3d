import * as THREE from 'three';

export const createStencilMaterial = (plane: THREE.Plane, isFront = true) =>
  new THREE.MeshBasicMaterial({
    clippingPlanes: [plane],
    depthWrite: false,
    depthTest: false,
    colorWrite: false,
    stencilWrite: true,
    side: isFront ? THREE.FrontSide : THREE.BackSide,
    stencilFunc: THREE.AlwaysStencilFunc,
    stencilFail: isFront
      ? THREE.IncrementWrapStencilOp
      : THREE.DecrementWrapStencilOp,
    stencilZFail: isFront
      ? THREE.IncrementWrapStencilOp
      : THREE.DecrementWrapStencilOp,
    stencilZPass: isFront
      ? THREE.IncrementWrapStencilOp
      : THREE.DecrementWrapStencilOp,
  });

export const createStencilPlaneMaterial = () =>
  new THREE.MeshBasicMaterial({
    stencilWrite: true,
    stencilRef: 0,
    stencilFunc: THREE.NotEqualStencilFunc,
    stencilFail: THREE.ReplaceStencilOp,
    stencilZFail: THREE.ReplaceStencilOp,
    stencilZPass: THREE.ReplaceStencilOp,
  });
