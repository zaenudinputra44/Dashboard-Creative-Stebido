import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  try {
    console.log("Creating monitoring_pekerjaan_kol table...");
    await sql`
      CREATE TABLE IF NOT EXISTS monitoring_pekerjaan_kol (
        id SERIAL PRIMARY KEY,
        week VARCHAR(255),
        nama_kol VARCHAR(255),
        platform VARCHAR(255),
        link_akun VARCHAR(255),
        nama_produk VARCHAR(255),
        jenis_kerjasama VARCHAR(255),
        pic_kol VARCHAR(255),
        status VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Table created successfully!");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

setup();
