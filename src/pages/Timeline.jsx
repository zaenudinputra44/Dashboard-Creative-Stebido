import React, { useState } from 'react';
import { jobsData } from '../data/dummyData';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../tables.css';

const Timeline = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredJobs = jobsData.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.pic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Selesai': return 'badge-success';
      case 'Proses': return 'badge-warning';
      case 'Terlambat': return 'badge-danger';
      default: return 'badge-gray';
    }
  };

  const getProgress = (status) => {
    switch(status) {
      case 'Selesai': return 100;
      case 'Proses': return 50;
      case 'Terlambat': return 75;
      default: return 0;
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <h2>Timeline Pekerjaan</h2>
        <button className="action-btn">
          <FiPlus /> Tambah Pekerjaan
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari pekerjaan atau PIC..." 
            className="filter-input pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">Semua Status</option>
          <option value="Selesai">Selesai</option>
          <option value="Proses">Proses</option>
          <option value="Terlambat">Terlambat</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Judul Pekerjaan</th>
              <th>PIC</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map(job => (
              <tr key={job.id}>
                <td>#{job.id}</td>
                <td className="font-medium">{job.title}</td>
                <td>{job.pic}</td>
                <td>{job.deadline}</td>
                <td>
                  <span className={`badge ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '100px' }}>
                      <div className="progress-bar-container" style={{ marginTop: 0 }}>
                        <div className="progress-bar" style={{ width: `${getProgress(job.status)}%`, backgroundColor: job.status === 'Terlambat' ? 'var(--danger-color)' : '' }}></div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getProgress(job.status)}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ color: 'var(--text-muted)' }}><FiEdit2 /></button>
                    <button style={{ color: 'var(--danger-color)' }}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data pekerjaan ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timeline;
