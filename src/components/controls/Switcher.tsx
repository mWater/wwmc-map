import React from 'react';
import { MapType } from '../../types';

interface SwitcherProps {
  mapType: MapType;
  onMapTypeChange: (mapType: MapType) => void;
}

const Switcher: React.FC<SwitcherProps> = ({ mapType, onMapTypeChange }) => {
  return (
    <div className="btn-group" role="group" style={{ backgroundColor: 'white' }}>
      <button
        type="button"
        className={`btn ${mapType === 'wwmc_main' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => onMapTypeChange('wwmc_main')}
      >
        Water Quality
      </button>
      <button
        type="button"
        className={`btn ${mapType === 'wwmc_water_actions' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => onMapTypeChange('wwmc_water_actions')}
      >
        Water Actions
      </button>
    </div>
  );
};

export default Switcher;