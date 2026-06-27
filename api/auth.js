import { sql } from './db.js';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action } = req.body;

    // 1. LOGIN
    if (action === 'login') {
      const { username, password } = req.body;
      const data = await sql`SELECT id, name, role, username FROM users WHERE username = ${username} AND password = ${password}`;
      
      if (data.length > 0) {
        return res.status(200).json(data[0]); // Return user session
      } else {
        return res.status(401).json({ error: 'Username atau password salah!' });
      }
    }

    // 2. FORGOT PASSWORD
    if (action === 'forgot') {
      const { email } = req.body;
      const data = await sql`SELECT id, name FROM users WHERE email = ${email}`;
      
      if (data.length === 0) {
        // Demi keamanan, tetap return success agar tidak membocorkan email mana yang terdaftar
        return res.status(200).json({ success: true, message: 'Jika email terdaftar, instruksi reset akan dikirim.' });
      }

      // Generate 6-digit token
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60000); // 15 mins expiry

      await sql`
        UPDATE users 
        SET reset_token = ${token}, reset_expires = ${expires}
        WHERE email = ${email}
      `;

      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_PASS;

      if (!gmailUser || !gmailPass) {
        // Fallback untuk testing tanpa GMAIL env
        console.warn(`[Mock Email] Token untuk ${email} adalah: ${token}`);
        return res.status(200).json({ success: true, message: `[Simulasi LOKAL] Email terkirim. Token Anda: ${token}` });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      const mailOptions = {
        from: `"Creative Stebido Dashboard" <${gmailUser}>`,
        to: email,
        subject: 'Kode Reset Password - Creative Stebido',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">Creative Stebido</h2>
            <p>Halo ${data[0].name},</p>
            <p>Kami menerima permintaan Reset Password untuk akun Anda.</p>
            <p>Berikut adalah <strong>Kode Reset (OTP)</strong> Anda:</p>
            <div style="font-size: 24px; font-weight: bold; text-align: center; background: #f3f4f6; padding: 10px; letter-spacing: 5px; margin: 20px 0;">
              ${token}
            </div>
            <p>Kode ini hanya berlaku selama <strong>15 menit</strong>. Jangan berikan kode ini kepada siapa pun.</p>
            <p>Jika Anda tidak memintanya, abaikan saja email ini.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, message: 'Kode reset password telah dikirim ke email Anda.' });
    }

    // 3. RESET PASSWORD
    if (action === 'reset') {
      const { email, token, newPassword } = req.body;
      const data = await sql`
        SELECT id FROM users 
        WHERE email = ${email} AND reset_token = ${token} AND reset_expires > NOW()
      `;

      if (data.length === 0) {
        return res.status(400).json({ error: 'Token reset tidak valid atau sudah kedaluwarsa.' });
      }

      await sql`
        UPDATE users 
        SET password = ${newPassword}, reset_token = NULL, reset_expires = NULL
        WHERE email = ${email}
      `;

      return res.status(200).json({ success: true, message: 'Password berhasil diperbarui! Silakan login.' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
