import { sql } from './db.js';
import { teamData, monitoringData, contentPerformance, technicalIssues } from '../src/data/dummyData.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Create Tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        reset_token VARCHAR(255),
        reset_expires TIMESTAMP
      );
    `;

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
        ad_id VARCHAR(100),
        ctr DECIMAL(10,2),
        transactions INT,
        budget_spent DECIMAL(10,2) DEFAULT 0,
        roas DECIMAL(10,2) DEFAULT 0,
        faktor_sukses TEXT,
        skala_tindakan VARCHAR(100) DEFAULT 'Scale Up Budget',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS not_winning_contents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        ad_id VARCHAR(100),
        ctr DECIMAL(10,2),
        conversion_rate DECIMAL(10,2),
        budget_spent DECIMAL(10,2) DEFAULT 0,
        cpc DECIMAL(10,2) DEFAULT 0,
        cpa DECIMAL(10,2) DEFAULT 0,
        roas DECIMAL(10,2) DEFAULT 0,
        indikasi_masalah TEXT,
        decision VARCHAR(100) DEFAULT 'Belum Ditentukan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS api_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100),
        target_role VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        nama_aset VARCHAR(255) NOT NULL,
        kategori VARCHAR(50) NOT NULL,
        jumlah INTEGER DEFAULT 1,
        pemegang_aset VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Aktif',
        tanggal_masuk VARCHAR(50),
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Removed TRUNCATE and INSERT operations to protect production data.
    // The tables are created safely using IF NOT EXISTS.
    
    return res.status(200).json({ message: 'Database migrated successfully without altering existing data!' });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed', details: error.message });
  }
}
