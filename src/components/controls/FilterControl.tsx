import React from 'react';

interface FilterControlProps {
  yearFilter: string;
  onYearFilterChange: (year: string) => void;
}

const FilterControl: React.FC<FilterControlProps> = ({ yearFilter, onYearFilterChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onYearFilterChange(e.target.value);
  };

  return (
    <div className="card" style={{ opacity: 0.8 }}>
      <div className="card-header">
        <h6 className="card-title mb-0">
          Filter by year
        </h6>
      </div>
      <div className="card-body">
        <select 
          id="year_selector" 
          className="form-select mb-0"
          value={yearFilter}
          onChange={handleChange}
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
  );
};

export default FilterControl;