import React from 'react';

interface WaterActionFilterControlProps {
  yearFilter: string;
  actionType: string;
  onYearFilterChange: (year: string) => void;
  onActionTypeChange: (actionType: string) => void;
}

const WaterActionFilterControl: React.FC<WaterActionFilterControlProps> = ({ 
  yearFilter, 
  actionType,
  onYearFilterChange,
  onActionTypeChange 
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onYearFilterChange(e.target.value);
  };

  const handleActionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onActionTypeChange(e.target.value);
  };

  return (
    <div className="card map-legend">
      <div className="card-header">
        <h3 className="card-title">
          Water Actions Filter
        </h3>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="selector" className="form-label">Action Type</label>
          <select 
            id="selector" 
            className="form-select"
            value={actionType}
            onChange={handleActionTypeChange}
          >
            <option value="all">All Actions</option>
            <option value="flushing">Flushing</option>
            <option value="plogging">Plogging</option>
          </select>
        </div>
        <div>
          <label htmlFor="year_selector" className="form-label">Year</label>
          <select 
            id="year_selector" 
            className="form-select"
            value={yearFilter}
            onChange={handleYearChange}
          >
            <option value="">All</option>
            {years.map(year => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default WaterActionFilterControl;