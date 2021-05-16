import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { setupLight } from './lights';
import { createStencilMaterial, createStencilPlaneMaterial } from './stencils';
import { ClipDirection, IS_DEV, NETWORKS, TNetworks } from '../utils/constants';

class Brain3D {
  private _isColored = true;
  private _clippingPlane: THREE.Plane | null = null;
  private _tempClipMeshs: any[] = [];
  private gltfLoader = new GLTFLoader();
  private dracoLoader = new DRACOLoader();

  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );

  // cameraHUD: THREE.OrthographicCamera;
  // sceneHUD: THREE.Scene;

  private scene: THREE.Scene = new THREE.Scene();
  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ alpha: true });
  controls: OrbitControls = new OrbitControls(
    this.camera,
    this.renderer.domElement
  );

  constructor() {
    this.dracoLoader.setDecoderPath('/draco/');
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // RENDERER
    this.renderer.localClippingEnabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // CAMERA
    this.setCamera(-394, 100, 242, false);

    // Controls
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  setPlaneConstant(constant: number) {
    if (this._clippingPlane && constant <= 100 && constant >= -100) {
      this._clippingPlane.constant = constant;
    }
  }

  setCamera(x: number, y: number, z: number, animate = true) {
    const coords = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    };

    if (animate) {
      new TWEEN.Tween(coords)
        .to({ x, y, z }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.camera.position.x = coords.x;
          this.camera.position.y = coords.y;
          this.camera.position.z = coords.z;
        })
        .start();
    } else {
      this.camera.position.x = x;
      this.camera.position.y = y;
      this.camera.position.z = z;
    }
  }

  clipDirection(direction: ClipDirection) {
    let normal: THREE.Vector3;

    this._tempClipMeshs.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.scene.remove(mesh);
    });
    this._tempClipMeshs = [];

    switch (direction) {
      case ClipDirection.FRONT:
        normal = new THREE.Vector3(0, 0, -1);
        break;
      case ClipDirection.TOP:
        normal = new THREE.Vector3(0, -1, 0);
        break;
      case ClipDirection.LEFT:
        normal = new THREE.Vector3(1, 0, 0);
        break;
      case ClipDirection.RIGHT:
        normal = new THREE.Vector3(-1, 0, 0);
        break;
    }

    const planeNormal = normal.normalize();
    this._clippingPlane = new THREE.Plane(planeNormal, 0);
    this._clippingPlane.constant = 100;

    for (const [, network] of Object.entries(NETWORKS)) {
      if (network.mesh) {
        (network.mesh.material as THREE.MeshStandardMaterial).clippingPlanes = [
          this._clippingPlane,
        ];

        const backStencilMat = createStencilMaterial(
          this._clippingPlane,
          false
        );
        const frontStencilMat = createStencilMaterial(this._clippingPlane);
        const planeStencilMat = createStencilPlaneMaterial();

        const frontMesh = new THREE.Mesh(
          network.mesh.geometry,
          frontStencilMat
        );
        frontMesh.position.copy(network.mesh.position);
        frontMesh.rotation.copy(network.mesh.rotation);
        this.scene.add(frontMesh);

        const backMesh = new THREE.Mesh(network.mesh.geometry, backStencilMat);
        backMesh.position.copy(network.mesh.position);
        backMesh.rotation.copy(network.mesh.rotation);
        this.scene.add(backMesh);

        const planeMesh = new THREE.Mesh(
          new THREE.PlaneBufferGeometry(200, 200),
          planeStencilMat
        );
        this.scene.add(planeMesh);

        planeMesh.scale.setScalar(100);
        this._clippingPlane.coplanarPoint(planeMesh.position);
        planeMesh.material.color.setHex(network.color);

        planeMesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, -1),
          normal.normalize()
        );

        this._tempClipMeshs.push(frontMesh);
        this._tempClipMeshs.push(backMesh);
        this._tempClipMeshs.push(planeMesh);
      }
    }

    // HELPER
    if (IS_DEV) {
      const planeHelper = new THREE.PlaneHelper(
        this._clippingPlane,
        200,
        0xffffff
      );
      this.scene.add(planeHelper);
      this._tempClipMeshs.push(planeHelper);
    }
  }

  init() {
    this.scene.clear();

    // HELPER
    if (IS_DEV) {
      this.scene.add(new THREE.GridHelper(200, 40));
    }

    setupLight(this.scene);

    this.gltfLoader
      .setDRACOLoader(this.dracoLoader)
      .load('/compressed.glb', (gltf: GLTF) => {
        gltf.scene.traverse((mesh) => {
          if (mesh instanceof THREE.Mesh) {
            const currentMesh: THREE.Mesh<
              THREE.BufferGeometry,
              THREE.MeshLambertMaterial
            > = new THREE.Mesh(
              mesh.geometry,
              new THREE.MeshLambertMaterial({ side: THREE.DoubleSide })
            );
            currentMesh.geometry.computeVertexNormals();
            currentMesh.position.z += 18;

            NETWORKS[mesh.name as TNetworks].mesh = currentMesh;
            currentMesh.material.color.setHex(
              NETWORKS[mesh.name as TNetworks].color
            );

            this.scene.add(currentMesh);
          }
        });

        this.clipDirection(ClipDirection.RIGHT);
      });

    this.animate();
  }

  toggleColor() {
    this.shouldRenderColor(!this._isColored);

    this._isColored = !this._isColored;
  }

  shouldRenderColor(withColor = true) {
    for (const [, network] of Object.entries(NETWORKS)) {
      if (network.mesh) {
        const material = network.mesh
          .material as unknown as THREE.MeshStandardMaterial;

        if (withColor) {
          material.color.setHex(network.color);
        } else {
          material.color.setRGB(0.5, 0.5, 0.5);
        }
        material.opacity = 1;
      }
    }
  }

  selectNetwork(networkName?: TNetworks) {
    for (const [name, network] of Object.entries(NETWORKS)) {
      if (network.mesh) {
        const material = network.mesh
          .material as unknown as THREE.MeshStandardMaterial;

        material.color.setHex(network.color);
        material.transparent = true;
        material.opacity = 1;

        if (networkName && name !== networkName) {
          material.color.setRGB(0.5, 0.5, 0.5);
          material.transparent = true;
          material.opacity = 0.6;
        }
      }
    }
  }

  setHUD() {
    // HUD
    // this.sceneHUD = new THREE.Scene();
    // this.cameraHUD = new THREE.OrthographicCamera(
    //   -window.innerWidth / 2,
    //   window.innerWidth / 2,
    //   window.innerHeight / 2,
    //   -window.innerHeight / 2,
    //   0,
    //   30
    // );
    // const hudPlane = new THREE.Mesh(
    //   new THREE.PlaneGeometry(200, 300),
    //   new THREE.MeshBasicMaterial({
    //     transparent: true,
    //     opacity: 0.5,
    //   })
    // );
    // hudPlane.position.x += window.innerWidth / 2 - 120;
    // hudPlane.position.y -= window.innerHeight / 2 - 170;
    // sceneHUD.add(hudPlane);
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    // cameraHUD.left = -window.innerWidth / 2;
    // cameraHUD.right = window.innerWidth / 2;
    // cameraHUD.top = window.innerHeight / 2;
    // cameraHUD.bottom = -window.innerHeight / 2;
    // cameraHUD.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.renderer.render(this.scene, this.camera);
    this.controls.update();

    // this._clippingPlane.constant = Math.sin(Date.now() * 0.0005) * Math.PI * 30;
    // renderer.autoClear = false;
    // renderer.render(sceneHUD, cameraHUD);
    TWEEN.update();
  }
}

export const Brain3DInstance = new Brain3D();
