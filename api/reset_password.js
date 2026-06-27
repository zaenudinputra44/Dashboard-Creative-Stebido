import nodemailer from 'nodemailer';
import { sql } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Alamat email tidak valid.' });
  }

  try {
    // Ambil kredensial Gmail dari database api_settings
    const settingsData = await sql`SELECT setting_key, setting_value FROM api_settings WHERE setting_key IN ('GMAIL_USER', 'GMAIL_PASS')`;
    
    let gmailUser = '';
    let gmailPass = '';

    settingsData.forEach(item => {
      if (item.setting_key === 'GMAIL_USER') gmailUser = item.setting_value;
      if (item.setting_key === 'GMAIL_PASS') gmailPass = item.setting_value;
    });

    if (!gmailUser || !gmailPass) {
      return res.status(500).json({ 
        error: 'Sistem belum dikonfigurasi untuk mengirim email. Silakan minta Administrator (Leader) untuk mengatur Email dan App Password Gmail di menu Pengaturan.' 
      });
    }

    // Konfigurasi Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass, // App Password
      },
    });

    // Konten Email (Karena user di-hardcode, hanya kirim notifikasi)
    const mailOptions = {
      from: `"Creative Stebido Dashboard" <${gmailUser}>`,
      to: email,
      subject: 'Permintaan Reset Password - Creative Stebido',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4F46E5; text-align: center;">Creative Stebido</h2>
          <p>Halo,</p>
          <p>Kami menerima permintaan <strong>Reset Password</strong> untuk akun yang terhubung dengan alamat email ini (${email}).</p>
          <p style="background-color: #FEF3C7; color: #92400E; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <strong>Catatan Penting:</strong><br/>
            Saat ini, sistem kami menggunakan pengaturan keamanan terpusat. Untuk mereset password Anda dan memulihkan akses ke Dashboard, silakan <strong>hubungi Administrator (Leader) Anda secara langsung</strong>.
          </p>
          <p>Jika Anda tidak meminta reset password ini, abaikan saja pesan ini.</p>
          <br/>
          <p style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
            Email ini dikirim secara otomatis oleh Sistem Dashboard Creative Stebido.
          </p>
        </div>
      `,
    };

    // Kirim Email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: `Email reset password telah berhasil dikirim ke ${email}.` });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ error: 'Gagal mengirim email. Pastikan App Password Gmail yang diinput sudah benar. Detail: ' + error.message });
  }
}
