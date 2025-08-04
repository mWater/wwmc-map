import React, { useEffect, useRef } from 'react';
import { DisplayType } from '../../types';

interface LegendControlProps {
  displayType: DisplayType;
  onDisplayTypeChange: (displayType: DisplayType) => void;
  apiUrl: string;
  mapType: string;
}

const LegendControl: React.FC<LegendControlProps> = ({ 
  displayType, 
  onDisplayTypeChange, 
  apiUrl, 
  mapType 
}) => {
  const legendContentRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDisplayTypeChange(e.target.value as DisplayType);
  };

  useEffect(() => {
    if (mapType !== 'wwmc_water_actions' && legendContentRef.current) {
      const query = `type=${mapType}&display=${displayType}`;
      const fullPath = `${apiUrl}maps/legend?${query}`;
      
      fetch(fullPath)
        .then(response => response.text())
        .then(html => {
          if (legendContentRef.current) {
            legendContentRef.current.innerHTML = html;
          }
        })
        .catch(error => {
          console.error('Error loading legend:', error);
        });
    }
  }, [displayType, mapType, apiUrl]);

  return (
    <div className="card map-legend">
      <div className="card-header">
        <h3 className="card-title">
          <select 
            id="selector" 
            className="form-select" 
            value={displayType}
            onChange={handleChange}
          >
            <option value="ph">pH</option>
            <option value="visited">Visited</option>
            <option value="turbidity">Turbidity</option>
            <option value="dissolved_oxygen">Oxygen</option>
          </select>
        </h3>
      </div>
      <div className="card-body">
        <div id="legend_contents" ref={legendContentRef}>
          {/* Legend content will be loaded dynamically */}
        </div>
      </div>
    </div>
  );
};

export default LegendControl;