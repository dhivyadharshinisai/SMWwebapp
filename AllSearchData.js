import React, { useEffect, useState } from 'react';

const AllSearchData = ({ setCurrentPage }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    date: '',
    time: '',
    seo: '',
  });

  const fetchAllData = async () => {
    const response = await fetch('http://localhost:5000/api/searchhistories');
    const result = await response.json();
    setData(result);
    setFilteredData(result); // Initial display
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const parseTime = (timeStr) => {
    const parts = timeStr.split(' ');
    let totalSeconds = 0;

    parts.forEach(part => {
      if (part.includes('m')) totalSeconds += parseInt(part) * 60;
      if (part.includes('s')) totalSeconds += parseInt(part);
    });

    return totalSeconds;
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.type !== 'all') {
      const isHarmful = filters.type === 'harmful';
      filtered = filtered.filter((item) => item.isHarmful === isHarmful);
    }

    if (filters.date) {
      const targetDate = filters.date.split('-').reverse().join('/');
      filtered = filtered.filter((item) => item.dateAndTime.startsWith(targetDate));
    }

    if (filters.time) {
      filtered = filtered.filter((item) => {
        const seconds = parseTime(item.totalTimeSpent || '0s');

        switch (filters.time) {
          case 'lt1': return seconds < 60;
          case 'lt5': return seconds < 300;
          case 'lt10': return seconds < 600;
          case 'gt10': return seconds > 600;
          default: return true;
        }
      });
    }

    if (filters.seo) {
      filtered = filtered.filter((item) =>
        item.query.toLowerCase().includes(filters.seo.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Back Button */}
      <button
        style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.5rem 1rem' }}
        onClick={() => setCurrentPage('dashboard')}
      >
        ⬅ Back
      </button>

      <h2 style={{ textAlign: 'center' }}>All Search History</h2>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="harmful">Harmful</option>
          <option value="nonharmful">Non-Harmful</option>
        </select>

        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />

        <select name="time" value={filters.time} onChange={handleFilterChange}>
          <option value="">All Time</option>
          <option value="lt1">Less than 1 min</option>
          <option value="lt5">Less than 5 mins</option>
          <option value="lt10">Less than 10 mins</option>
          <option value="gt10">More than 10 mins</option>
        </select>

        <input
          type="text"
          name="seo"
          placeholder="Search keyword"
          value={filters.seo}
          onChange={handleFilterChange}
        />

        <button onClick={applyFilters} style={{ padding: '0.5rem 1rem' }}>Apply</button>
      </div>

      {/* Table */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Query</th>
            <th>Date & Time</th>
            <th>Time Spent</th>
            <th>Harmful</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{entry.query}</td>
              <td>{entry.dateAndTime}</td>
              <td>{entry.totalTimeSpent}</td>
              <td style={{ color: entry.isHarmful ? 'red' : 'green' }}>
                {entry.isHarmful ? 'Yes' : 'No'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllSearchData;
