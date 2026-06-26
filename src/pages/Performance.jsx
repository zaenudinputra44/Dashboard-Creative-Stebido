import React, { useState, useMemo, useEffect } from 'react';
import { contentPerformance } from '../data/dummyData';
import { FiSearch, FiFilter, FiDownload, FiChevronDown, FiChevronUp, FiLink, FiRefreshCw } from 'react-icons/fi';
import '../tables.css';

const Performance = () => {
  const [data, setData] = useState(contentPerformance);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState('All');
  const [filterRatio, setFilterRatio] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // State untuk form tambah data Meta Ads
  const [newLink, setNewLink] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Load dari localStorage jika ada
  useEffect(() => {
    const saved = localStorage.getItem('performanceData');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      // Tambahkan property metaLink ke data dummy awal
      const initialData = contentPerformance.map(item => ({
        ...item,
        metaLink: 'https://adsmanager.facebook.com/'
      }));
      setData(initialData);
    }
  }, []);

  const handleFetchMetaAds = (e) => {
    e.preventDefault();
    if (!newLink) return;

    setIsFetching(true);

    // Simulasi proses penarikan data dari Meta Ads API (delay 1.5 detik)
    setTimeout(() => {
      const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
      
      // Generate random mocked metrics
      const impressions = Math.floor(Math.random() * 100000) + 10000;
      const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR
      const ctr = ((clicks / impressions) * 100).toFixed(2);
      const transactions = Math.floor(clicks * (Math.random() * 0.05 + 0.005)); // 0.5-5.5% CVR
      const conversionRate = transactions > 0 ? ((transactions / clicks) * 100).toFixed(2) : '0.00';
      const roas = (Math.random() * 4 + 0.5).toFixed(1); // 0.5x - 4.5x ROAS

      const funnels = ['Cold', 'Warm', 'Hot'];
      const ratios = ['1:1', '4:5', '9:16'];

      const newData = {
        id: newId,
        title: `Konten Hasil Sync #${newId}`,
        funnel: funnels[Math.floor(Math.random() * funnels.length)],
        ratio: ratios[Math.floor(Math.random() * ratios.length)],
        impressions,
        clicks,
        ctr,
        transactions,
        conversionRate,
        roas,
        metaLink: newLink
      };

      const updatedData = [newData, ...data];
      setData(updatedData);
      localStorage.setItem('performanceData', JSON.stringify(updatedData));
      
      setNewLink('');
      setIsFetching(false);
    }, 1500);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFunnel = filterFunnel === 'All' || item.funnel === filterFunnel;
      const matchRatio = filterRatio === 'All' || item.ratio === filterRatio;
      return matchSearch && matchFunnel && matchRatio;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
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
  }, [searchTerm, filterFunnel, filterRatio, sortConfig, data]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const handleExportCSV = () => {
    const headers = ["Konten", "Link Konten", "Funnel", "Ratio", "Impressions", "Clicks", "CTR (%)", "Konversi", "CVR (%)", "ROAS"];
    
    const csvRows = [
      headers.join(","),
      ...processedData.map(item => [
        `"${item.title}"`,
        `"${item.metaLink || '-'}"`,
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

    const csvContent = csvRows.join("\n");
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

      <div className="card mb-4">
        <h3 className="card-title mb-4" style={{ fontSize: '1.1rem' }}>Sinkronisasi Meta Ads</h3>
        <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
          Masukkan link konten dari dashboard Meta Ads. Sistem akan otomatis menarik data performa (Impressions, Clicks, CTR, dll) untuk konten tersebut.
        </p>
        <form onSubmit={handleFetchMetaAds} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>URL Meta Ads Dashboard</label>
            <input 
              type="url" 
              className="filter-input" 
              style={{ width: '100%' }} 
              placeholder="https://adsmanager.facebook.com/..." 
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="action-btn" disabled={isFetching} style={{ minWidth: '150px', justifyContent: 'center' }}>
            {isFetching ? <><FiRefreshCw className="spin" /> Menarik Data...</> : <><FiLink /> Tarik Data Meta</>}
          </button>
        </form>
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
              <th>Link Konten</th>
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
                <td>
                  {item.metaLink && item.metaLink !== '-' ? (
                    <a href={item.metaLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiLink size={14} /> Meta Ads
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
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
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data yang cocok dengan pencarian Anda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Performance;
