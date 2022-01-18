import { useState } from "react";
import * as THREE from "three";
import DragControls from "drag-controls";
import { ThreeEvent } from "@react-three/fiber";
import { Object3D } from "three";
import { create } from "domain";

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
        console.log(child);

        if (child.name !== "reticle") {
          scene!.remove(child);
        }
      });
      initLights(scene);
    }
  };

  const initScene = (model: Object3D) => {
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

    model.position.set(0, -0.5, -1);
    model.scale.set(0.1, 0.1, 0.1);
    model.userData.name = "model";
    model.userData.dragable = true;
    // console.log(model);

    sc.add(model);
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(
      0,
      0.1,
      0
    );

    const onSelect = () => {
      if (reticle.visible) {
        const material = new THREE.MeshPhongMaterial({
          color: 0xffffff * Math.random(),
        });
        const mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
        mesh.scale.y = Math.random() * 2 + 1;
        mesh.position.setFromMatrixPosition(reticle.matrix);
        scene!.add(mesh);
        // scene!.getObjectByName("model");
        // model.position.setFromMatrixPosition(reticle.matrix);
      }
    };
    let controller = x.xr.getController(0);
    controller.addEventListener("select", onSelect);
    sc.add(controller);

    reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial()
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

  const createSessionIfSupported = (
    model: THREE.Object3D
  ): Promise<THREE.WebGLRenderer> => {
    return new Promise(async (resolve, reject) => {
      try {
        clearChildren();
        let supported = await isARSupported();
        if (supported) {
          const renderer = initScene(model);
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
