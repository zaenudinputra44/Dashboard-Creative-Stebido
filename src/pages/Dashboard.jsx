import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { kpiData, chartData, technicalIssues, monitoringData } from '../data/dummyData';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';

const KPICard = ({ title, value, icon, trend, trendValue, colorClass }) => (
  <div className="card kpi-card">
    <div className="kpi-header">
      <div>
        <h3 className="card-title">{title}</h3>
        <p className={`card-value ${colorClass}`}>{value}</p>
      </div>
      <div className={`kpi-icon ${colorClass}-bg`}>
        {icon}
      </div>
    </div>
    <div className="kpi-footer">
      <span className={`trend ${trend}`}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
      </span>
      <span className="trend-text">vs bulan lalu</span>
    </div>
  </div>
);

const Dashboard = () => {
  const dueTodayJobs = monitoringData.filter(job => job.status === 'Proses').slice(0, 3);
  const unresolvedIssues = technicalIssues.filter(issue => issue.status !== 'Selesai');

  return (
    <div className="dashboard-container">
      {/* KPI Section */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Pekerjaan" 
          value={kpiData.totalJobs} 
          icon={<FiCheckCircle size={24} />} 
          trend="up" 
          trendValue="10%" 
          colorClass="text-primary" 
        />
        <KPICard 
          title="Pekerjaan Selesai" 
          value={kpiData.completedJobs} 
          icon={<FiCheckCircle size={24} />} 
          trend="up" 
          trendValue="15%" 
          colorClass="text-success" 
        />
        <KPICard 
          title="Pekerjaan Masih Proses" 
          value={kpiData.inProgressJobs} 
          icon={<FiClock size={24} />} 
          trend="stable" 
          trendValue="0%" 
          colorClass="text-warning" 
        />
        <KPICard 
          title="Pekerjaan Terlambat" 
          value={kpiData.delayedJobs} 
          icon={<FiAlertTriangle size={24} />} 
          trend="down" 
          trendValue="5%" 
          colorClass="text-danger" 
        />
      </div>

      <div className="dashboard-main-grid">
        {/* Chart Section */}
        <div className="card chart-section">
          <h3 className="card-title">Grafik Target vs Realisasi Pekerjaan</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                />
                <Legend />
                <Bar dataKey="target" name="Target" fill="var(--gray-color)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realisasi" name="Realisasi" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar - Summary */}
        <div className="summary-section">
          <div className="card list-card">
            <h3 className="card-title flex-between">
              Ringkasan Hari Ini
            </h3>
            
            <div className="list-group">
              <h4 className="list-subtitle">Pekerjaan Jatuh Tempo</h4>
              {dueTodayJobs.map(job => (
                <div key={job.id} className="list-item">
                  <span className="item-dot bg-warning"></span>
                  <div className="item-content">
                    <p className="item-title">{job.judulKonten}</p>
                    <p className="item-desc">Executor: {job.executorCWM}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="list-group mt-4">
              <h4 className="list-subtitle">Kendala Belum Diselesaikan</h4>
              {unresolvedIssues.map(issue => (
                <div key={issue.id} className="list-item">
                  <span className="item-dot bg-danger"></span>
                  <div className="item-content">
                    <p className="item-title">{issue.issue}</p>
                    <p className="item-desc">Status: {issue.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card list-card mt-4 bg-gradient-primary">
            <h3 className="card-title text-white">Insight Otomatis</h3>
            <ul className="insight-list">
              <li><FiTrendingUp className="mr-2" /> PIC paling produktif minggu ini: <strong>Siti</strong></li>
              <li><FiTrendingUp className="mr-2" /> CTR tertinggi dicapai oleh Konten Marketing 3 (4.5%)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
