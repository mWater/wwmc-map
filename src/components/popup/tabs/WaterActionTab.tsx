import React, { useState } from 'react';

interface WaterActionTabProps {
  actions: any[];
  ploggingData: any[];
}

const WaterActionTab: React.FC<WaterActionTabProps> = ({ actions, ploggingData }) => {
  const [selectedAction, setSelectedAction] = useState('plogging');

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAction(e.target.value);
  };

  return (
    <div style={{ height: '280px', overflow: 'auto' }}>
      <br />
      <div className="mb-3">
        <strong>Action:</strong>
        <select 
          id="waterActionSelector" 
          className="form-select d-inline-block w-auto ms-2"
          value={selectedAction}
          onChange={handleActionChange}
        >
          <option value="plogging">Plogging</option>
        </select>
      </div>
      <br />
      <div id="subContent">
        {selectedAction === 'plogging' && (
          <div>
            <h6>Actions Summary</h6>
            {actions.length > 0 ? (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action Type</th>
                    <th>Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action, index) => (
                    <tr key={index}>
                      <td>{action.date}</td>
                      <td>{action.action_type}</td>
                      <td>{action.participants || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No water action data available</p>
            )}
            
            {ploggingData.length > 0 && (
              <div className="mt-3">
                <h6>Plogging Details</h6>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Distance</th>
                      <th>Pieces Collected</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ploggingData.map((data, index) => (
                      <tr key={index}>
                        <td>{data.date}</td>
                        <td>{data.duration || '-'}</td>
                        <td>{data.distance || '-'}</td>
                        <td>{data.pieces_collected || '-'}</td>
                        <td>{data.total_weight || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterActionTab;