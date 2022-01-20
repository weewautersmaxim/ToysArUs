import { useState } from "react";
import * as THREE from "three";
import DragControls from "drag-controls";
import { ThreeEvent } from "@react-three/fiber";
import { Object3D } from "three";
import { create } from "domain";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";

export const usePlaneDetection = (() => {
  let arSupported;
  let renderer: any = undefined;
  let scene: THREE.Scene | undefined = undefined;
  let arContainer: any = undefined;
  DragControls.install({ THREE: THREE });
  let reticle: any;
  let hitTestSource: any = null;
  let hitTestSourceRequested = false;

  const isARSupported = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if ("xr" in navigator) {
        let supported = (navigator as any).xr
          .isSessionSupported("immersive-ar")
          .then((supported: any) => {
            arSupported = supported;
            return supported;
          });
        resolve(supported);
      }
      reject(false);
    });
  };

  const initLights = (scene: THREE.Scene) => {
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 0, 0.25);
    scene.add(light);
  };

  const clearChildren = () => {
    if (scene) {
      scene.children.forEach((child: any) => {
        if (child.name !== "reticle") {
          scene!.remove(child);
        }
      });
      initLights(scene);
    }
  };

  const initScene = () => {
    const container = document.createElement("div");
    arContainer = container;
    container.classList.toggle("test");
    document.body.appendChild(container);
    let sc = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    initLights(sc);

    let x = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    x.setPixelRatio(window.devicePixelRatio);
    x.setSize(window.innerWidth, window.innerHeight);
    x.xr.enabled = true;
    // Add dragcontrols to the model

    const loader = new GLTFLoader();
    let customModel;
    loader.load("test2/scene.gltf", (gltf) => {
      //AnimationMixer look it up
      // customModel = new THREE.AnimationMixer(gltf.scene);
      // let action = customModel.clipAction(gltf.animations[0]);
      // action.play();
      // gltf.scene.add(customModel);
      // ////////////
      gltf.scene.scale.multiplyScalar(2);
      gltf.scene.position.x = 20; // once rescaled, position the model where needed
      gltf.scene.position.z = -20;
      customModel = gltf.scene;
      // gltf.scene.add(customModel);
    });

    const onSelect = () => {
      if (reticle.visible) {
        customModel.position.setFromMatrixPosition(reticle.matrix);
        scene!.add(customModel);
      }
    };
    let controller = x.xr.getController(0);
    controller.addEventListener("select", onSelect);
    sc.add(controller);

    reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 48).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x08abff })
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    reticle.name = "reticle";
    sc.add(reticle);
    // div.current!.appendChild(x.domElement);
    x.setAnimationLoop((timestamp, frame) => {
      if (frame) {
        const referenceSpace = x.xr.getReferenceSpace();
        const session = x.xr.getSession();

        if (hitTestSourceRequested === false) {
          session!
            .requestReferenceSpace("viewer")
            .then(function (referenceSpace) {
              session!
                .requestHitTestSource({ space: referenceSpace })
                .then(function (source) {
                  hitTestSource = source;
                });
            });

          session!.addEventListener("end", function () {
            hitTestSourceRequested = false;
            hitTestSource = null;
          });

          hitTestSourceRequested = true;
        }

        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length) {
            const hit = hitTestResults[0];

            reticle.visible = true;
            reticle.matrix.fromArray(
              hit.getPose(referenceSpace!)!.transform.matrix
            );
          } else {
            reticle.visible = false;
          }
        }
      }

      x.render(scene!, camera);
    });
    renderer = x;

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      x.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);
    scene = sc;
    return x;
  };

  const createSessionIfSupported = (): any => {
    return new Promise(async (resolve, reject) => {
      try {
        clearChildren();
        let supported = await isARSupported();
        if (supported) {
          const renderer = initScene();
          resolve(renderer);
        }
      } catch (e) {
        console.log(e);

        reject();
      }
    });
  };

  const getRenderer = () => {
    return renderer;
  };

  const getARContainer = () => {
    return arContainer;
  };

  return {
    getARContainer,
    isARSupported,
    createSessionIfSupported,
    getRenderer,
    clearChildren,
  };
})();
