import React, { useEffect, useState } from 'react';
import { Brain3DInstance } from './brain/Brain3D';
import { ClipDirection, NETWORKS, TNetworks } from './utils/constants';

import './style.scss';

export const App = () => {
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [range, setRange] = useState<number | undefined>();
  const [network, setNetwork] = useState<TNetworks | undefined>();
  const [side, setSide] = useState<ClipDirection | undefined>();
  const [rotation, setRotation] = useState(true);

  useEffect(() => {
    Brain3DInstance.init();
  }, []);

  useEffect(() => {
    Brain3DInstance.controls.autoRotate = rotation;
  }, [rotation]);

  useEffect(() => {
    if (range !== undefined) {
      Brain3DInstance.setPlaneConstant(+range);
    }
  }, [range]);

  useEffect(() => {
    if (side) {
      Brain3DInstance.clipDirection(side);
      Brain3DInstance.shouldRenderColor(false);
      Brain3DInstance.setPlaneConstant(0);
      if (side === ClipDirection.LEFT || side === ClipDirection.RIGHT) {
        Brain3DInstance.setCamera(
          side === ClipDirection.LEFT ? -280 : 280,
          0,
          0
        );
      } else if (side === ClipDirection.FRONT) {
        Brain3DInstance.setCamera(0, 0, 280);
      } else if (side === ClipDirection.TOP) {
        Brain3DInstance.setCamera(0, 280, 0);
      }
      setRotation(false);
      setNetwork(undefined);
      setRange(0);
    } else {
      Brain3DInstance.shouldRenderColor(true);
      Brain3DInstance.setCamera(-394, 100, 242);
      setRotation(true);
      setRange(100);
    }
  }, [side]);

  return (
    <div className={`settings ${!showMenu && 'offcanvas'}`}>
      <button
        className={`toggle ${!showMenu && 'active'}`}
        onClick={() => setShowMenu(!showMenu)}
      >
        {showMenu ? 'hide' : 'show menu'}
      </button>
      <div className="content">
        <h4>Networks</h4>
        <ul className="select-network">
          {Object.entries(NETWORKS).map(([key, net]) => (
            <li
              className={(key as TNetworks) === network ? 'active' : ''}
              onClick={() => {
                if ((key as TNetworks) === network) {
                  Brain3DInstance.selectNetwork();
                  Brain3DInstance.setCamera(-394, 100, 242);
                  setNetwork(undefined);
                } else {
                  Brain3DInstance.selectNetwork(key as TNetworks);
                  Brain3DInstance.setCamera.apply(Brain3DInstance, [
                    ...net.position,
                    true,
                  ] as any);
                  setNetwork(key as TNetworks);
                }
              }}
            >
              <div
                className="color"
                style={{ backgroundColor: `#${net.color.toString(16)}` }}
              ></div>
              <div className="name">
                {net.name} ({key})
              </div>
            </li>
          ))}
        </ul>

        <hr />

        <label>
          Stop rotation
          <input
            type="checkbox"
            checked={rotation}
            onInput={() => setRotation(!rotation)}
          />
        </label>

        <a
          download="yeo-screen.png"
          className="button"
          onClick={(e) => Brain3DInstance.createScreenshot(e)}
        >
          Create Screenshot
        </a>

        <hr />

        <h4>Clipping</h4>

        {side && (
          <label>
            Position
            <input
              type="range"
              value={range}
              min="-100"
              max="100"
              onInput={(e) => setRange(+e.currentTarget.value)}
            />
          </label>
        )}

        <button onClick={() => setSide(ClipDirection.LEFT)}>
          Cut left hemispheres
        </button>
        <button onClick={() => setSide(ClipDirection.RIGHT)}>
          Cut right hemispheres
        </button>
        <button onClick={() => setSide(ClipDirection.FRONT)}>
          Cut frontal
        </button>
        <button onClick={() => setSide(ClipDirection.TOP)}>
          Cut upper half
        </button>

        {side && (
          <button onClick={() => setSide(undefined)}>
            Show complete brain
          </button>
        )}

        <hr />
        <footer>
          Based on the{' '}
          <a
            target="_blank"
            href="https://surfer.nmr.mgh.harvard.edu/fswiki/CorticalParcellation_Yeo2011"
          >
            CorticalParcellation_Yeo2011
          </a>{' '}
          data. Created by Philip Stapelfeldt
        </footer>
      </div>
    </div>
  );
};
