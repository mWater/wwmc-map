import React, { useMemo } from 'react';
import moment from 'moment';

interface SpeciesTabProps {
  visitsData: any[];
}

const SpeciesTab: React.FC<SpeciesTabProps> = ({ visitsData }) => {
  const processedData = useMemo(() => {
    const data: any[] = [];
    
    // Only include visits where macroinvertebrate_data_available is true, like original
    for (const visitData of visitsData) {
      if (visitData.macroinvertebrate_data_available) {
        data.push({
          date: moment(visitData.date, moment.ISO_8601).format("ll"),
          caddisflies: visitData.caddisflies,
          dobsonflies: visitData.dobsonflies,
          mayflies: visitData.mayflies,
          stoneflies: visitData.stoneflies,
          craneflies: visitData.craneflies,
          dragonflies: visitData.dragonflies,
          scuds: visitData.scuds,
          leeches: visitData.leeches,
          midges: visitData.midges,
          pounchsnails: visitData.pounchsnails,
          tubiflexworms: visitData.tubiflexworms
        });
      }
    }
    
    return data;
  }, [visitsData]);

  const hasNoData = processedData.length === 0;

  const species = [
    { name: 'Caddisflies', key: 'caddisflies', level: 'success' },
    { name: 'Dobsonflies', key: 'dobsonflies', level: 'success' },
    { name: 'Mayflies', key: 'mayflies', level: 'success' },
    { name: 'Stoneflies', key: 'stoneflies', level: 'success' },
    { name: 'Craneflies', key: 'craneflies', level: 'warning' },
    { name: 'Dragonflies', key: 'dragonflies', level: 'warning' },
    { name: 'Scuds', key: 'scuds', level: 'warning' },
    { name: 'Leeches', key: 'leeches', level: 'danger' },
    { name: 'Midges', key: 'midges', level: 'danger' },
    { name: 'Pounch snails', key: 'pounchsnails', level: 'danger' },
    { name: 'Tubiflex worms', key: 'tubiflexworms', level: 'danger' }
  ];

  return (
    <div style={{ height: '280px', overflow: 'auto' }}>
      <br />
      {hasNoData ? (
        <p>No data</p>
      ) : (
        <table id="speciesTable" className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Species</th>
              {processedData.map((visit, index) => (
                <th key={index}>{visit.date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {species.map((speciesItem, speciesIndex) => (
              <tr key={speciesIndex} className={`table-${speciesItem.level}`}>
                <th scope="row">{speciesItem.name}</th>
                {processedData.map((visit, visitIndex) => (
                  <td key={visitIndex}>
                    {visit[speciesItem.key] && (
                      <i className="bi bi-check" aria-hidden="true"></i>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SpeciesTab;