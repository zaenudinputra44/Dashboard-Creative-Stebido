import React, { useState, useMemo } from 'react';
import { contentPerformance } from '../data/dummyData';
import { FiSearch, FiFilter, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import '../tables.css';

const Performance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState('All');
  const [filterRatio, setFilterRatio] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let filtered = contentPerformance.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFunnel = filterFunnel === 'All' || item.funnel === filterFunnel;
      const matchRatio = filterRatio === 'All' || item.ratio === filterRatio;
      return matchSearch && matchFunnel && matchRatio;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Convert to numbers if applicable
        if (sortConfig.key === 'ctr' || sortConfig.key === 'conversionRate' || sortConfig.key === 'roas') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [searchTerm, filterFunnel, filterRatio, sortConfig]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const handleExportCSV = () => {
    // 1. Definisikan header kolom
    const headers = ["Konten", "Funnel", "Ratio", "Impressions", "Clicks", "CTR (%)", "Konversi", "CVR (%)", "ROAS"];
    
    // 2. Map data ke bentuk baris CSV
    const csvRows = [
      headers.join(","), // Baris pertama adalah header
      ...processedData.map(item => [
        `"${item.title}"`,
        `"${item.funnel}"`,
        `"${item.ratio}"`,
        item.impressions,
        item.clicks,
        item.ctr,
        item.transactions,
        item.conversionRate,
        item.roas
      ].join(","))
    ];

    // 3. Gabungkan semua baris dengan newline
    const csvContent = csvRows.join("\n");

    // 4. Buat file Blob dan trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Performa_Konten.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <h2>Performa Konten</h2>
        <button className="action-btn secondary" onClick={handleExportCSV}>
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari konten..." 
            className="filter-input pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-input" value={filterFunnel} onChange={(e) => setFilterFunnel(e.target.value)}>
          <option value="All">Semua Funnel</option>
          <option value="Cold">Cold</option>
          <option value="Warm">Warm</option>
          <option value="Hot">Hot</option>
        </select>
        <select className="filter-input" value={filterRatio} onChange={(e) => setFilterRatio(e.target.value)}>
          <option value="All">Semua Ratio</option>
          <option value="1:1">1:1</option>
          <option value="4:5">4:5</option>
          <option value="9:16">9:16</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} style={{cursor: 'pointer'}}>Konten {renderSortIcon('title')}</th>
              <th onClick={() => handleSort('funnel')} style={{cursor: 'pointer'}}>Funnel {renderSortIcon('funnel')}</th>
              <th onClick={() => handleSort('ratio')} style={{cursor: 'pointer'}}>Ratio {renderSortIcon('ratio')}</th>
              <th onClick={() => handleSort('impressions')} style={{cursor: 'pointer'}}>Impressions {renderSortIcon('impressions')}</th>
              <th onClick={() => handleSort('clicks')} style={{cursor: 'pointer'}}>Clicks {renderSortIcon('clicks')}</th>
              <th onClick={() => handleSort('ctr')} style={{cursor: 'pointer'}}>CTR (%) {renderSortIcon('ctr')}</th>
              <th onClick={() => handleSort('transactions')} style={{cursor: 'pointer'}}>Konversi {renderSortIcon('transactions')}</th>
              <th onClick={() => handleSort('conversionRate')} style={{cursor: 'pointer'}}>CVR (%) {renderSortIcon('conversionRate')}</th>
              <th onClick={() => handleSort('roas')} style={{cursor: 'pointer'}}>ROAS {renderSortIcon('roas')}</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">{item.title}</td>
                <td><span className={`badge ${item.funnel === 'Hot' ? 'badge-danger' : item.funnel === 'Warm' ? 'badge-warning' : 'badge-info'}`}>{item.funnel}</span></td>
                <td>{item.ratio}</td>
                <td>{item.impressions.toLocaleString()}</td>
                <td>{item.clicks.toLocaleString()}</td>
                <td>
                  <span style={{ color: parseFloat(item.ctr) > 2 ? 'var(--success-color)' : 'inherit' }}>
                    {item.ctr}%
                  </span>
                </td>
                <td>{item.transactions}</td>
                <td>{item.conversionRate}%</td>
                <td>
                  <span style={{ color: parseFloat(item.roas) >= 3 ? 'var(--success-color)' : parseFloat(item.roas) < 1.5 ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>
                    {item.roas}x
                  </span>
                </td>
              </tr>
            ))}
            {processedData.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data yang cocok dengan pencarian Anda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Performance;
