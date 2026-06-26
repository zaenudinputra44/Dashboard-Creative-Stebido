import { sql } from './db.js';
import { teamData, monitoringData, contentPerformance, technicalIssues } from '../src/data/dummyData.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Create Tables
    await sql`
      CREATE TABLE IF NOT EXISTS monitoring_pekerjaan (
        id SERIAL PRIMARY KEY,
        week VARCHAR(50),
        produk VARCHAR(100),
        link_konten VARCHAR(255),
        tanggal_konten VARCHAR(50),
        judul_konten VARCHAR(255),
        jenis_konten VARCHAR(50),
        ratio VARCHAR(20),
        funnel VARCHAR(20),
        executor_cwm VARCHAR(100),
        pic_konten VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Baru Masuk'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS technical_issues (
        id SERIAL PRIMARY KEY,
        issue TEXT NOT NULL,
        severity VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Baru Masuk'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS evaluations (
        id SERIAL PRIMARY KEY,
        week VARCHAR(100) NOT NULL,
        notes JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        meta_link TEXT,
        funnel VARCHAR(50),
        ratio VARCHAR(20),
        impressions INT,
        clicks INT,
        transactions INT,
        roas DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS winning_contents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        ctr DECIMAL(10,2),
        transactions INT,
        faktor_sukses TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS not_winning_contents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        ctr DECIMAL(10,2),
        conversion_rate DECIMAL(10,2),
        indikasi_masalah TEXT,
        decision VARCHAR(100) DEFAULT 'Belum Ditentukan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Clear existing data (optional, but good for fresh migration)
    await sql`TRUNCATE TABLE monitoring_pekerjaan RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE technical_issues RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE evaluations RESTART IDENTITY CASCADE`;

    // 3. Seed Monitoring Data
    for (const item of monitoringData) {
      await sql`
        INSERT INTO monitoring_pekerjaan 
        (week, produk, link_konten, tanggal_konten, judul_konten, jenis_konten, ratio, funnel, executor_cwm, pic_konten, status)
        VALUES 
        (${item.week}, ${item.produk}, ${item.linkKonten}, ${item.tanggalKonten}, ${item.judulKonten}, ${item.jenisKonten}, ${item.ratio}, ${item.funnel}, ${item.executorCWM}, ${item.picKonten}, ${item.status || 'Selesai'})
      `;
    }

    // 4. Seed Technical Issues
    for (const item of technicalIssues) {
      await sql`
        INSERT INTO technical_issues (issue, severity, status)
        VALUES (${item.issue}, ${item.severity}, ${item.status})
      `;
    }

    // 5. Seed Initial Evaluation
    await sql`
      INSERT INTO evaluations (week, notes)
      VALUES (
        'Minggu Ke-2, Juni 2026', 
        '["CTR Video Edukasi meningkat 2% setelah thumbnail diganti.", "Tim skripter sudah memenuhi target mingguan.", "Perlu perbaikan pada server hosting karena sempat down 2 jam."]'::jsonb
      )
    `;

    return res.status(200).json({ message: 'Database migrated and seeded successfully!' });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed', details: error.message });
  }
}
