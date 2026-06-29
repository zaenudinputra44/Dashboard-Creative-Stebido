import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiTrendingUp, FiCheckSquare, FiDollarSign } from 'react-icons/fi';
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
  const [monitoringData, setMonitoringData] = useState([]);
  const [technicalIssues, setTechnicalIssues] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  
  const fetchData = async () => {
    try {
      const [monRes, techRes, evalRes, perfRes] = await Promise.all([
        fetch('/api/monitoring').then(r => r.ok ? r.json() : []),
        fetch('/api/technical').then(r => r.ok ? r.json() : []),
        fetch('/api/evaluation').then(r => r.ok ? r.json() : []),
        fetch('/api/performance').then(r => r.ok ? r.json() : [])
      ]);
      setMonitoringData(monRes);
      setTechnicalIssues(techRes);
      setEvaluations(evalRes);
      setPerformanceData(perfRes);
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const totalJobs = monitoringData.length;
  const completedJobs = monitoringData.filter(job => job.status === 'Selesai').length;
  const inProgressJobs = monitoringData.filter(job => job.status !== 'Selesai').length;

  const dueTodayJobs = monitoringData.filter(job => job.status !== 'Selesai').slice(0, 3);
  const unresolvedIssues = technicalIssues.filter(issue => issue.status !== 'Selesai');
  
  // Transform monitoring data for productivity chart
  const executorStats = {};
  monitoringData.forEach(job => {
    const exec = job.executorCWM || 'Tanpa Executor';
    if (!executorStats[exec]) {
      executorStats[exec] = { name: exec.split(' ')[0], selesai: 0, proses: 0, total: 0 };
    }
    executorStats[exec].total += 1;
    if (job.status === 'Selesai') {
      executorStats[exec].selesai += 1;
    } else {
      executorStats[exec].proses += 1;
    }
  });

  const dynamicChartData = Object.values(executorStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Identify top PIC dynamically
  const picStats = {};
  monitoringData.forEach(job => {
    if (job.status === 'Selesai') {
      const pic = job.executorCWM ? job.executorCWM.split(' ')[0] : 'Unknown';
      picStats[pic] = (picStats[pic] || 0) + 1;
    }
  });
  let topPic = 'Belum Ada';
  let topPicScore = 0;
  Object.keys(picStats).forEach(pic => {
    if (picStats[pic] > topPicScore) {
      topPicScore = picStats[pic];
      topPic = pic;
    }
  });

  return (
    <div className="dashboard-container">
      {/* KPI Section */}
      <div className="kpi-grid">
        <KPICard 
          title="Total Pekerjaan" 
          value={totalJobs} 
          icon={<FiCheckCircle size={24} />} 
          trend="up" 
          trendValue="10%" 
          colorClass="text-primary" 
        />
        <KPICard 
          title="Pekerjaan Selesai" 
          value={completedJobs} 
          icon={<FiCheckCircle size={24} />} 
          trend="up" 
          trendValue="15%" 
          colorClass="text-success" 
        />
        <KPICard 
          title="Pekerjaan Masih Proses" 
          value={inProgressJobs} 
          icon={<FiClock size={24} />} 
          trend="stable" 
          trendValue="0%" 
          colorClass="text-warning" 
        />
      </div>

      <div className="dashboard-main-grid">
        {/* Chart Section */}
        <div className="card chart-section">
          <h3 className="card-title">Grafik Produktivitas Tim (Top 5 Executor)</h3>
          <div className="chart-container">
            {dynamicChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dynamicChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                />
                <Legend />
                <Bar dataKey="selesai" name="Pekerjaan Selesai" fill="var(--success-color)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="proses" name="Pekerjaan Proses" fill="var(--warning-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Belum ada data monitoring pekerjaan.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Summary */}
        <div className="summary-section">
          <div className="card list-card">
            <h3 className="card-title flex-between">
              Ringkasan Hari Ini
            </h3>
            
            <div className="list-group">
              <h4 className="list-subtitle">Pekerjaan Belum Selesai (Proses)</h4>
              {dueTodayJobs.map(job => (
                <div key={job.id} className="list-item">
                  <span className="item-dot bg-warning"></span>
                  <div className="item-content">
                    <p className="item-title">{job.judulKonten}</p>
                    <p className="item-desc">PIC: {job.picKonten}</p>
                  </div>
                </div>
              ))}
              {dueTodayJobs.length === 0 && (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Semua pekerjaan sudah diselesaikan!</p>
              )}
            </div>

            <div className="list-group mt-4">
              <h4 className="list-subtitle">Kendala Belum Diselesaikan</h4>
              {unresolvedIssues.map(issue => (
                <div key={issue.id} className="list-item">
                  <span className="item-dot bg-danger"></span>
                  <div className="item-content">
                    <p className="item-title">{issue.issue}</p>
                    <p className="item-desc">Severity: {issue.severity} | Status: {issue.status}</p>
                  </div>
                </div>
              ))}
              {unresolvedIssues.length === 0 && (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Tidak ada kendala teknis.</p>
              )}
            </div>

            <div className="list-group mt-4">
              <h4 className="list-subtitle">Evaluasi & Rekomendasi Terbaru</h4>
              {evaluations.slice(0, 2).map(evalItem => (
                <div key={evalItem.id} className="list-item" style={{ alignItems: 'flex-start' }}>
                  <span className="item-dot bg-primary" style={{ marginTop: '5px' }}></span>
                  <div className="item-content">
                    <p className="item-title">{evalItem.week}</p>
                    <ul style={{ paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {(evalItem.notes || []).slice(0, 2).map((note, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {evaluations.length === 0 && (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Belum ada catatan evaluasi.</p>
              )}
            </div>
          </div>
          
          <div className="card list-card mt-4 bg-gradient-primary">
            <h3 className="card-title text-white">Insight Otomatis</h3>
            <ul className="insight-list">
              <li><FiTrendingUp className="mr-2" /> PIC paling produktif saat ini: <strong>{topPic}</strong> ({topPicScore} Selesai)</li>
              <li><FiTrendingUp className="mr-2" /> Tingkat penyelesaian tim: <strong>{totalJobs > 0 ? Math.round((completedJobs/totalJobs)*100) : 0}%</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
