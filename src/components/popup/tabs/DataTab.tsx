import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Context, Site } from '../../../types';

interface DataTabProps {
  ctx: Context;
  site: Site;
  visitsData: any[];
}

interface MeasureData {
  date: string;
  formattedDate: string;
  ph?: number;
  turbidity?: number;
  turbidityUnit?: string;
  waterTemperature?: number;
  waterTemperatureUnit?: string;
  dissolvedOxygen?: number;
  dissolvedOxygenUnit?: string;
  dissolvedOxygenSaturation?: number;
  dissolvedOxygenSaturationUnit?: string;
  nitrate?: number;
  nitrateUnit?: string;
  nitrite?: number;
  nitriteUnit?: string;
  phosphate?: number;
  phosphateUnit?: string;
}

const DataTab: React.FC<DataTabProps> = ({ ctx, site, visitsData }) => {
  const [selectedMeasure, setSelectedMeasure] = useState('ph');
  const [data, setData] = useState<MeasureData[]>([]);

  useEffect(() => {
    const processedData: MeasureData[] = [];
    
    for (const visitData of visitsData) {
      const measures: MeasureData = {
        date: visitData.date,
        formattedDate: visitData.date.length <= 10 
          ? moment(visitData.date, moment.ISO_8601).format("ll") 
          : moment(visitData.date, moment.ISO_8601).format("lll")
      };

      if (visitData.ph != null) {
        measures.ph = visitData.ph;
      }

      if (visitData.turbidity != null) {
        measures.turbidity = visitData.turbidity.quantity;
        measures.turbidityUnit = visitData.turbidity.units;
      }

      if (visitData.water_temperature != null) {
        measures.waterTemperature = visitData.water_temperature.quantity;
        measures.waterTemperatureUnit = visitData.water_temperature.units;
      }

      if (visitData.dissolved_oxygen != null) {
        measures.dissolvedOxygen = visitData.dissolved_oxygen.quantity;
        measures.dissolvedOxygenUnit = visitData.dissolved_oxygen.units;
      }

      if (visitData.dissolved_oxygen_saturation != null) {
        measures.dissolvedOxygenSaturation = visitData.dissolved_oxygen_saturation.quantity;
        measures.dissolvedOxygenSaturationUnit = visitData.dissolved_oxygen_saturation.units;
      }

      if (visitData.nitrate != null) {
        measures.nitrate = visitData.nitrate.quantity;
        measures.nitrateUnit = visitData.nitrate.units;
      }

      if (visitData.nitrite != null) {
        measures.nitrite = visitData.nitrite.quantity;
        measures.nitriteUnit = visitData.nitrite.units;
      }

      if (visitData.phosphate != null) {
        measures.phosphate = visitData.phosphate.quantity;
        measures.phosphateUnit = visitData.phosphate.units;
      }

      processedData.push(measures);
    }

    setData(processedData);
  }, [visitsData]);

  const handleMeasureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMeasure(e.target.value);
  };

  const renderDataTable = () => {
    const filteredData = data.filter(d => {
      switch (selectedMeasure) {
        case 'ph':
          return d.ph != null;
        case 'water_temperature':
          return d.waterTemperature != null;
        case 'dissolved_oxygen':
          return d.dissolvedOxygen != null;
        case 'dissolved_oxygen_saturation':
          return d.dissolvedOxygenSaturation != null;
        case 'nitrite':
          return d.nitrite != null;
        case 'nitrate':
          return d.nitrate != null;
        case 'phosphate':
          return d.phosphate != null;
        default:
          return false;
      }
    });

    if (filteredData.length === 0) {
      return <p>No data available for {selectedMeasure}</p>;
    }

    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Value</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => {
            let value, unit;
            
            switch (selectedMeasure) {
              case 'ph':
                value = row.ph;
                unit = '';
                break;
              case 'water_temperature':
                value = row.waterTemperature;
                unit = row.waterTemperatureUnit;
                break;
              case 'dissolved_oxygen':
                value = row.dissolvedOxygen;
                unit = row.dissolvedOxygenUnit;
                break;
              case 'dissolved_oxygen_saturation':
                value = row.dissolvedOxygenSaturation;
                unit = row.dissolvedOxygenSaturationUnit;
                break;
              case 'nitrite':
                value = row.nitrite;
                unit = row.nitriteUnit;
                break;
              case 'nitrate':
                value = row.nitrate;
                unit = row.nitrateUnit;
                break;
              case 'phosphate':
                value = row.phosphate;
                unit = row.phosphateUnit;
                break;
            }

            return (
              <tr key={index}>
                <td>{row.formattedDate}</td>
                <td>{value}</td>
                <td>{unit}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="mt-3" style={{ minWidth: '700px', height: '280px', overflow: 'auto' }}>
      <br />
      <div className="mb-3">
        <strong>Measure:</strong>
        <select 
          id="selector" 
          className="form-select d-inline-block w-auto ms-2"
          value={selectedMeasure}
          onChange={handleMeasureChange}
        >
          <option value="ph">pH</option>
          <option value="water_temperature">Temperature</option>
          <option value="dissolved_oxygen">Oxygen</option>
          <option value="dissolved_oxygen_saturation">Oxygen Saturation</option>
          <option value="nitrite">Nitrite</option>
          <option value="nitrate">Nitrate</option>
          <option value="phosphate">Phosphate</option>
        </select>
      </div>
      <div id="subContent">
        {renderDataTable()}
      </div>
    </div>
  );
};

export default DataTab;