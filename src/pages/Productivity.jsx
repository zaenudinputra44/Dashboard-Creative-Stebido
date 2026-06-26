import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { teamData, kpiData } from '../data/dummyData';

const Productivity = () => {
  const filteredTeamData = teamData.filter(
    (member) => member.role !== 'Supervisor' && member.role !== 'Manager'
  );

  const productivityChartData = filteredTeamData.map((member) => ({
    name: member.name.split(' ')[0],
    selesai: 0,
    revisi: 0,
    terlambat: 0,
    ketepatan: 0,
    kualitas: 0,
  }));

  return (
    <div className="page-container">
      <h2>Produktivitas Tim</h2>
      
      <div className="dashboard-main-grid">
        <div className="card">
          <h3 className="card-title">Skor Produktivitas</h3>
          <div className="kpi-grid mt-4">
            <div className="kpi-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                0
              </div>
              <p className="card-title" style={{ marginTop: '0.5rem' }}>Kategori: <strong>Belum Ada Data</strong></p>
            </div>
          </div>
          
          <h4 className="list-subtitle" style={{ marginTop: '2rem' }}>Formula Perhitungan:</h4>
          <ul style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Pencapaian Target:</strong> Jumlah Pekerjaan Selesai / Target x 100</li>
            <li><strong>Ketepatan Waktu:</strong> Tepat Waktu / Total Selesai x 100</li>
            <li><strong>Skor Produktivitas:</strong> 40% Target + 30% Ketepatan + 30% Kualitas</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title">Perbandingan Produktivitas Leader & Staff</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                <Legend />
                <Bar dataKey="selesai" name="Selesai" fill="var(--success-color)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revisi" name="Revisi" fill="var(--warning-color)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terlambat" name="Terlambat" fill="var(--danger-color)" radius={[4, 4, 0, 0]} />
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
              <th>Nama PIC</th>
              <th>Role</th>
              <th>Pekerjaan Selesai</th>
              <th>Ketepatan Waktu</th>
              <th>Skor Kualitas</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeamData.map((member, index) => (
              <tr key={member.id}>
                <td>{index + 1}</td>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>{productivityChartData[index].selesai}</td>
                <td>{productivityChartData[index].ketepatan}%</td>
                <td>{productivityChartData[index].kualitas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Productivity;
