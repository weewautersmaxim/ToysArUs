// //@ts-nocheck
import { isRenderer } from "@react-three/fiber/dist/declarations/src/core/store";
import React, { useEffect, useRef, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { usePlaneDetection } from "./ArLogic";

const ARButton = () => {
  const [arSupported, setArSupported] = useState(false);
  const [sessionInit, setSessionInit] = useState<any>({});
  const [currentSession, setCurrentSession] = useState<any>();
  const [overlayShown, setOverlayShown] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement>();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();

  // let overlay: any = undefined;
  const overlay = useRef<HTMLDivElement>(null);
  const {
    createSessionIfSupported,
    getRenderer,
    getARContainer,
    clearChildren,
  } = usePlaneDetection;
  useEffect(() => {
    if (sessionInit.optionalFeatures === undefined) {
      sessionInit.optionalFeatures = [];
      sessionInit.requiredFeatures = [];
    }

    sessionInit.optionalFeatures.push("dom-overlay");
    sessionInit.requiredFeatures.push("hit-test");
    sessionInit.domOverlay = { root: overlay.current! };
    if ("xr" in navigator) {
      (navigator as any).xr
        .isSessionSupported("immersive-ar")
        .then((supported: any) => {
          setArSupported(supported);
          const loader = new GLTFLoader();
          loader.load(
            "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/SimpleSkinning.gltf",
            (gltf) => {
              const mesh = gltf.scene.children[0];
              createSessionIfSupported(mesh).then((renderer) => {
                setRenderer(renderer);
                setContainer(getARContainer());
              });
              // mesh.add(gltf.scene);
            }
          );
        });
    }
  }, []);
  const startSession = () => {
    if (arSupported && currentSession === undefined) {
      sessionInit.domOverlay = { root: overlay.current! };
      (navigator as any).xr
        .requestSession("immersive-ar", sessionInit)
        .then(async (session: any) => {
          clearChildren();
          setCurrentSession(undefined);
          overlay.current!.classList.toggle("hidden");
          renderer!.xr.setReferenceSpaceType("local");
          overlay.current!.classList.toggle("test");

          setOverlayShown(true);
          setCurrentSession(session);

          await renderer!.xr.setSession(session);
        });
    }
  };

  const closeSession = () => {
    currentSession.end();
    setOverlayShown(false);
  };

  return (
    <>
      {arSupported && (
        <div>
          {renderer && (
            <button
              className={`${arSupported ? "c-ar" : "test"} `}
              onClick={startSession}
            >
              watch in AR <img src="ar.svg" alt="Augmented reality" />
            </button>
          )}

          <div ref={overlay} className="hidden pointer-events-none">
            <button
              className="text-white absolute right-8 top-8 pointer-events-auto"
              onClick={closeSession}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ARButton;
