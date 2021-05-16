import React, { useEffect, useState } from 'react';
import { Brain3DInstance } from './brain/Brain3D';
import { ClipDirection, NETWORKS, TNetworks } from './utils/constants';

import './style.css';

export const App = () => {
  const [range, setRange] = useState<number | undefined>();
  const [network, setNetwork] = useState<TNetworks | undefined>();
  const [side, setSide] = useState<ClipDirection | undefined>();

  useEffect(() => {
    Brain3DInstance.init();
  }, []);

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
      Brain3DInstance.setCamera(side === ClipDirection.LEFT ? -280 : 280, 0, 0);
      Brain3DInstance.controls.autoRotate = false;
      setRange(0);
    } else {
      Brain3DInstance.shouldRenderColor(true);
      Brain3DInstance.setCamera(-394, 100, 242);
      Brain3DInstance.controls.autoRotate = true;
      setRange(100);
    }
  }, [side]);

  return (
    <div className="settings">
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

      <h4>Cerebral hemispheres</h4>

      {side && (
        <label>
          Clipping
          <br />
          <input
            type="range"
            value={range}
            min="-100"
            max="100"
            onInput={(e) => setRange(+e.currentTarget.value)}
          />
        </label>
      )}

      <button onClick={() => setSide(ClipDirection.LEFT)}>Clip left</button>
      <button onClick={() => setSide(ClipDirection.RIGHT)}>Clip right</button>

      {side && <button onClick={() => setSide(undefined)}>show full</button>}

      <footer>
        Based on the{' '}
        <a href="https://surfer.nmr.mgh.harvard.edu/fswiki/CorticalParcellation_Yeo2011">
          CorticalParcellation_Yeo2011
        </a>{' '}
        data. Created by Philip Stapelfeldt
      </footer>
    </div>
  );
};
