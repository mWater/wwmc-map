import React from 'react';
import { MapType } from '../../types';

interface SwitcherProps {
  mapType: MapType;
  onMapTypeChange: (mapType: MapType) => void;
}

const Switcher: React.FC<SwitcherProps> = ({ mapType, onMapTypeChange }) => {
  const baseButtonStyle = {
    backgroundColor: '#e99855',
    borderRadius: '0',
    color: '#fff',
    textTransform: 'uppercase' as const,
    minHeight: '60px',
    paddingTop: '20px',
    paddingBottom: '20px',
    boxShadow: '0 10px 0 0 rgb(0 0 0 / 13%)',
    border: 'none'
  };

  const activeButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#e07013'
  };

  const hoverStyle = {
    boxShadow: '0 10px 0 0 rgb(0 0 0 / 25%)'
  };

  return (
    <div className="btn-group" role="group">
      <button
        type="button"
        className="btn"
        style={mapType === 'wwmc_main' ? activeButtonStyle : baseButtonStyle}
        onClick={() => onMapTypeChange('wwmc_main')}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = hoverStyle.boxShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = baseButtonStyle.boxShadow;
        }}
      >
        Water Quality
      </button>
      <button
        type="button"
        className="btn"
        style={mapType === 'wwmc_water_actions' ? activeButtonStyle : baseButtonStyle}
        onClick={() => onMapTypeChange('wwmc_water_actions')}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = hoverStyle.boxShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = baseButtonStyle.boxShadow;
        }}
      >
        Water Actions
      </button>
    </div>
  );
};

export default Switcher;