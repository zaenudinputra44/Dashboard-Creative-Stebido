import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FiDownload } from 'react-icons/fi';

const Productivity = () => {
  const [monitoringData, setMonitoringData] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accFilter, setAccFilter] = useState('harian');

  const fetchData = async () => {
    try {
      const [monRes, usersRes] = await Promise.all([
        fetch('/api/monitoring').then(r => {
          if (!r.ok) throw new Error('API not available');
          return r.json();
        }).catch(() => []),
        fetch('/api/users').then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      
      setMonitoringData(monRes);
      if (Array.isArray(usersRes)) {
        setTeamMembers(usersRes);
      }
      setIsLoading(false);
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const productivityChartData = useMemo(() => {
    if (!monitoringData.length) return [];
    
    // Identifikasi nama yang merupakan Supervisor atau Manager
    const excludedNames = teamMembers
      .filter(user => user.role.toLowerCase().includes('supervisor') || user.role.toLowerCase().includes('manager'))
      .map(user => user.name.split(' ')[0].toLowerCase());
    
    // Kelompokkan pekerjaan berdasarkan Executor CWM
    const picStats = {};
    monitoringData.forEach(job => {
      if (!job.executorCWM) return;
      
      const picName = job.executorCWM.split(' ')[0];
      
      // Lewati jika nama ini termasuk supervisor atau manager
      if (excludedNames.includes(picName.toLowerCase())) return;

      if (!picStats[picName]) {
        picStats[picName] = { 
          name: picName, 
          selesai: 0, 
          proses: 0,
          terlambat: 0,
          ketepatan: 100,
          kualitas: 100
        };
      }
      
      if (job.status === 'Selesai') {
        picStats[picName].selesai += 1;
      } else {
        picStats[picName].proses += 1;
      }
    });

    return Object.values(picStats).sort((a, b) => b.selesai - a.selesai);
  }, [monitoringData, teamMembers]);

  // Total selesai keseluruhan tim
  const totalSelesai = productivityChartData.reduce((acc, curr) => acc + curr.selesai, 0);
  const rataRataSelesai = productivityChartData.length > 0 ? (totalSelesai / productivityChartData.length).toFixed(1) : 0;

  const accumulationData = useMemo(() => {
    if (!monitoringData.length) return { harian: [], bulanan: [], tahunan: [] };
    
    const acc = { harian: {}, bulanan: {}, tahunan: {} };

    monitoringData.forEach(job => {
      if (!job.tanggalKonten) return;
      
      const date = new Date(job.tanggalKonten);
      if (isNaN(date.getTime())) return;

      const dayStr = job.tanggalKonten; // YYYY-MM-DD
      const monthStr = job.tanggalKonten.substring(0, 7); // YYYY-MM
      const yearStr = job.tanggalKonten.substring(0, 4); // YYYY

      // Harian
      if (!acc.harian[dayStr]) acc.harian[dayStr] = { period: dayStr, total: 0, selesai: 0, proses: 0 };
      acc.harian[dayStr].total += 1;
      if (job.status === 'Selesai') acc.harian[dayStr].selesai += 1;
      else acc.harian[dayStr].proses += 1;

      // Bulanan
      if (!acc.bulanan[monthStr]) acc.bulanan[monthStr] = { period: monthStr, total: 0, selesai: 0, proses: 0 };
      acc.bulanan[monthStr].total += 1;
      if (job.status === 'Selesai') acc.bulanan[monthStr].selesai += 1;
      else acc.bulanan[monthStr].proses += 1;

      // Tahunan
      if (!acc.tahunan[yearStr]) acc.tahunan[yearStr] = { period: yearStr, total: 0, selesai: 0, proses: 0 };
      acc.tahunan[yearStr].total += 1;
      if (job.status === 'Selesai') acc.tahunan[yearStr].selesai += 1;
      else acc.tahunan[yearStr].proses += 1;
    });

    return {
      harian: Object.values(acc.harian).sort((a,b) => b.period.localeCompare(a.period)), // Terlama di bawah
      bulanan: Object.values(acc.bulanan).sort((a,b) => b.period.localeCompare(a.period)),
      tahunan: Object.values(acc.tahunan).sort((a,b) => b.period.localeCompare(a.period))
    };
  }, [monitoringData]);

  const handleExportAccumulation = () => {
    const dataToExport = accumulationData[accFilter];
    const headers = ["Periode", "Total Pekerjaan Masuk", "Pekerjaan Selesai", "Pekerjaan Masih Proses", "Tingkat Penyelesaian (%)"];
    const csvRows = [
      headers.join(","),
      ...dataToExport.map(item => [
        `"${item.period}"`,
        item.total,
        item.selesai,
        item.proses,
        Math.round((item.selesai / item.total) * 100)
      ].join(","))
    ];
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Akumulasi_Pekerjaan_${accFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <h2>Produktivitas Tim (Real-Time)</h2>
      </div>
      
      <div className="dashboard-main-grid">
        <div className="card">
          <h3 className="card-title">Skor Produktivitas Tim</h3>
          <div className="kpi-grid mt-4">
            <div className="kpi-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {totalSelesai}
              </div>
              <p className="card-title" style={{ marginTop: '0.5rem' }}>Total Pekerjaan <strong>Selesai</strong></p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Rata-rata {rataRataSelesai} pekerjaan / Executor CWM</p>
            </div>
          </div>
          
          <h4 className="list-subtitle" style={{ marginTop: '2rem' }}>Insight Otomatis:</h4>
          <ul style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Data ditarik secara <em>real-time</em> dari ceklis menu <strong>Monitoring Pekerjaan</strong>.</li>
            <li><strong>Peringkat 1:</strong> {productivityChartData.length > 0 ? productivityChartData[0].name : '-'}</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title">Perbandingan Pekerjaan Selesai (Executor CWM)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Legend />
                <Bar dataKey="selesai" name="Selesai" fill="var(--success-color)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="proses" name="Masih Proses" fill="var(--warning-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="card-title">Ranking Produktivitas</h3>
        <table className="data-table mt-4">
          <thead>
            <tr>
              <th>Peringkat</th>
              <th>Executor CWM</th>
              <th>Pekerjaan Selesai (✅)</th>
              <th>Masih Proses (⏳)</th>
              <th>Ketepatan Waktu</th>
            </tr>
          </thead>
          <tbody>
            {productivityChartData.map((member, index) => (
              <tr key={member.name}>
                <td>
                  {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                </td>
                <td className="font-medium">{member.name}</td>
                <td>
                  <span style={{ fontWeight: 'bold', color: member.selesai > 0 ? 'var(--success-color)' : 'inherit' }}>
                    {member.selesai} Pekerjaan
                  </span>
                </td>
                <td>{member.proses} Pekerjaan</td>
                <td>{member.ketepatan}% (Otomatis)</td>
              </tr>
            ))}
            {productivityChartData.length === 0 && !isLoading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                  Belum ada data pekerjaan di menu Monitoring.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card mt-4">
        <div className="flex-between mb-4">
          <h3 className="card-title">Akumulasi Pekerjaan Secara Keseluruhan</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select className="filter-input" value={accFilter} onChange={(e) => setAccFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}>
              <option value="harian">Harian (Per Hari)</option>
              <option value="bulanan">Bulanan (Per Bulan)</option>
              <option value="tahunan">Tahunan (Per Tahun)</option>
            </select>
            <button className="action-btn secondary" onClick={handleExportAccumulation}>
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Periode ({accFilter === 'harian' ? 'Tanggal' : accFilter === 'bulanan' ? 'Bulan' : 'Tahun'})</th>
              <th>Total Pekerjaan Masuk</th>
              <th>Pekerjaan Selesai (✅)</th>
              <th>Pekerjaan Masih Proses (⏳)</th>
              <th>Tingkat Penyelesaian</th>
            </tr>
          </thead>
          <tbody>
            {accumulationData[accFilter].map((item) => (
              <tr key={item.period}>
                <td className="font-medium">{item.period}</td>
                <td>{item.total}</td>
                <td><span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>{item.selesai}</span></td>
                <td><span style={{ color: 'var(--warning-color)', fontWeight: 'bold' }}>{item.proses}</span></td>
                <td>{Math.round((item.selesai / item.total) * 100)}%</td>
              </tr>
            ))}
            {accumulationData[accFilter].length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                  Belum ada data akumulasi untuk periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Productivity;
