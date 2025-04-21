import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AllSearchData from './AllSearchData';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const Dashboard = ({ userDetails }) => {
  const [searchHistories, setSearchHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('entire');
  const [deleteFilter, setDeleteFilter] = useState('entire');
  const [currentPage, setCurrentPage] = useState('dashboard');

  const fetchSearchHistories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/searchhistories');
      if (response.ok) {
        const data = await response.json();
        setSearchHistories(data);
      } else {
        console.error('Failed to fetch search histories');
      }
    } catch (err) {
      console.error('Error fetching search histories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchHistories();
  }, []);

  if (!userDetails) {
    return <p>Loading user data...</p>;
  }

  const userId = userDetails._id?.$oid || userDetails._id;
  const userHistory = searchHistories.filter(h => h.userId === userId);

  const filterData = () => {
    const now = new Date();
    if (filter === 'today') {
      return userHistory.filter(h => {
        const date = new Date(h.dateAndTime);
        return date.toDateString() === now.toDateString();
      });
    }
    if (filter === 'this_week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      return userHistory.filter(h => new Date(h.dateAndTime) >= startOfWeek);
    }
    if (filter === 'this_month') {
      const currentMonth = new Date().getMonth();
      return userHistory.filter(h => new Date(h.dateAndTime).getMonth() === currentMonth);
    }
    return userHistory;
  };

  const filteredHistory = filterData();
  const harmfulCount = filteredHistory.filter(h => h.isHarmful).length;
  const nonHarmfulCount = filteredHistory.length - harmfulCount;
  const total = harmfulCount + nonHarmfulCount;

  const pieData = {
    labels: ['Harmful', 'Non-Harmful'],
    datasets: [{
      data: [harmfulCount, nonHarmfulCount],
      backgroundColor: ['#ff4d4f', '#4caf50'],
    }],
  };

  const pieOptions = {
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${label}: ${percentage}% (${value})`;
        },
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14,
        },
      },
      legend: {
        position: 'bottom',
      },
    },
  };

  const handleReset = async () => {
    if (!window.confirm(`Are you sure you want to delete ${deleteFilter} data?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/searchhistories/${userId}?filter=${deleteFilter}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert(`Successfully deleted ${deleteFilter} data.`);
        await fetchSearchHistories();
      } else {
        alert('Failed to delete data.');
      }
    } catch (err) {
      console.error('Error deleting search history:', err);
    }
  };

  if (currentPage === 'allSearch') {
    return <AllSearchData setCurrentPage={setCurrentPage} />;
  }

  const getViewText = () => {
    switch (filter) {
      case 'today': return 'Showing Today\'s Data';
      case 'this_week': return 'Showing This Week\'s Data';
      case 'this_month': return 'Showing This Month\'s Data';
      case 'entire': return 'Showing Entire Data';
      default: return '';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Search History</h2>

      {/* Controls Row */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
  {/* View Filter Dropdown - Left */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <label style={{ fontWeight: 'bold' }}>View Data:</label>
    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="today">Today</option>
      <option value="this_week">This Week</option>
      <option value="this_month">This Month</option>
      <option value="entire">Entire</option>
    </select>
  </div>

  {/* Reset/Delete - Right */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <label style={{ fontWeight: 'bold' }}>Reset Data:</label>
    <select value={deleteFilter} onChange={(e) => setDeleteFilter(e.target.value)}>
      <option value="today">Today</option>
      <option value="this_week">This Week</option>
      <option value="this_month">This Month</option>
      <option value="entire">Entire</option>
    </select>
    <button
      onClick={handleReset}
      style={{
        backgroundColor: '#ff4d4f',
        color: 'white',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '5px',
      }}
    >
      Reset
    </button>
  </div>
</div>



      {/* View Text */}
      <p style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>{getViewText()}</p>

      {loading ? (
        <p>Loading search history...</p>
      ) : filteredHistory.length === 0 ? (
        <p>No search history available for the selected view.</p>
      ) : (
        <>
          <h2>Harmful vs Non-Harmful Searches</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </>
      )}

     

      {/* View All Data Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '1rem',
            backgroundColor: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentPage('allSearch')}
        >
          View Overall Search Data
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
