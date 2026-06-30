@echo off
echo ========================================================
echo MENSINKRONKAN LOCALHOST KE WEB UTAMA (VERCEL)
echo ========================================================
echo.
echo Langkah 1: Tekan Enter untuk Login ke Vercel
echo (Browser Anda akan terbuka otomatis, silakan klik tombol verifikasi di sana)
echo.
call npx vercel login
echo.
echo Jika login sudah berhasil, tekan sembarang tombol untuk mulai Sinkronisasi (Upload)...
pause
echo.
echo Langkah 2: Sedang mengupload dan menyinkronkan data...
echo.
call npx vercel --prod --yes
echo.
echo ========================================================
echo Selesai! Web utama Anda sekarang sudah sama dengan localhost.
echo Silakan buka web Anda dan Refresh (Ctrl+F5).
echo ========================================================
pause
