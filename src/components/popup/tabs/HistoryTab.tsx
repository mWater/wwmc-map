import React, { useMemo } from 'react';
import moment from 'moment';
import { unitToString } from '../../../utils/unit';

interface HistoryTabProps {
  visitsData: any[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ visitsData }) => {
  const hasNoData = visitsData.length === 0;

  const processedData = useMemo(() => {
    const data: any[] = [];
    let hasNitrite = false;
    let hasNitrate = false; 
    let hasPhosphate = false;
    
    // Process data exactly like original - reverse order
    for (const visitData of visitsData.slice().reverse()) {
      const measures: any = {
        date: visitData.date && visitData.date.length <= 10 
          ? moment(visitData.date, moment.ISO_8601).format("ll") 
          : moment(visitData.date, moment.ISO_8601).format("lll")
      };

      if (visitData.ph != null) {
        measures.ph = visitData.ph;
      }

      if (visitData.turbidity?.quantity != null) {
        measures.turbidity = visitData.turbidity.quantity + " " + unitToString("turbidity", visitData.turbidity.units);
      }

      if (visitData.water_temperature?.quantity != null) {
        measures.waterTemperature = visitData.water_temperature.quantity + " " + unitToString("water_temperature", visitData.water_temperature.units);
      }

      if (visitData.dissolved_oxygen?.quantity != null) {
        measures.dissolvedOxygen = visitData.dissolved_oxygen.quantity + " " + unitToString("dissolved_oxygen", visitData.dissolved_oxygen.units);
      }

      if (visitData.dissolved_oxygen_saturation?.quantity != null) {
        measures.dissolvedOxygenSaturation = visitData.dissolved_oxygen_saturation.quantity + " " + unitToString("dissolved_oxygen_saturation", visitData.dissolved_oxygen_saturation.units);
      }

      if (visitData.nitrite?.quantity != null) {
        hasNitrite = true;
        measures.nitrite = visitData.nitrite.quantity + " " + unitToString("nitrite", visitData.nitrite.units);
      }

      if (visitData.nitrate?.quantity != null) {
        hasNitrate = true;
        measures.nitrate = visitData.nitrate.quantity + " " + unitToString("nitrate", visitData.nitrate.units);
      }

      if (visitData.phosphate?.quantity != null) {
        hasPhosphate = true;
        measures.phosphate = visitData.phosphate.quantity + " " + unitToString("phosphate", visitData.phosphate.units);
      }

      data.push(measures);
    }

    // Add flags to all data items like original
    for (const d of data) {
      d.hasPhosphate = hasPhosphate;
      d.hasNitrate = hasNitrate;
      d.hasNitrite = hasNitrite;
    }

    return { data, hasNitrite, hasNitrate, hasPhosphate };
  }, [visitsData]);

  const { data, hasNitrite, hasNitrate, hasPhosphate } = processedData;

  return (
    <div style={{ height: '280px', overflow: 'auto' }}>
      <br />
      {hasNoData ? (
        <p>No data</p>
      ) : (
        <table id="historyTable" className="table table-bordered">
          <thead>
            <tr>
              <th>Date</th>
              <th>Turbidity</th>
              <th>pH</th>
              <th>Temperature</th>
              <th>Oxygen</th>
              <th>Oxygen Saturation</th>
              {hasNitrite && <th>Nitrite</th>}
              {hasNitrate && <th>Nitrate</th>}
              {hasPhosphate && <th>Phosphate</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, index: number) => (
              <tr key={index}>
                <th scope="row">{row.date}</th>
                <td>{row.turbidity || '-'}</td>
                <td>{row.ph || '-'}</td>
                <td>{row.waterTemperature || '-'}</td>
                <td>{row.dissolvedOxygen || '-'}</td>
                <td>{row.dissolvedOxygenSaturation || '-'}</td>
                {hasNitrite && <td>{row.nitrite || '-'}</td>}
                {hasNitrate && <td>{row.nitrate || '-'}</td>}
                {hasPhosphate && <td>{row.phosphate || '-'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoryTab;