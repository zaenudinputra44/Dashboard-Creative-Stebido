export const teamData = [
  { id: 1, name: "Ian", role: "Leader Content Web Marketing", username: "leadercwm1", password: "123" },
  { id: 2, name: "Udin", role: "Leader Content Web Marketing", username: "leadercwm2", password: "123" },
  { id: 3, name: "Kiki", role: "Leader Advertising", username: "leaderadv", password: "123" },
  { id: 4, name: "Ibenk", role: "Supervisor", username: "supervisor", password: "123" },
  { id: 5, name: "Mas Radit", role: "Manager", username: "manager", password: "123" },
  { id: 6, name: "Munif", role: "Skripter", username: "skripter1", password: "123" },
  { id: 7, name: "Brili", role: "Skripter", username: "skripter2", password: "123" },
  { id: 8, name: "Sani", role: "Staff Content Web Marketing", username: "staffcwm1", password: "123" },
  { id: 9, name: "Ujank", role: "Staff Content Web Marketing", username: "staffcwm2", password: "123" },
  { id: 10, name: "Abing", role: "Staff Content Web Marketing", username: "staffcwm3", password: "123" }
];

export const kpiData = {
  totalJobs: 25,
  completedJobs: 18,
  inProgressJobs: 5,
  delayedJobs: 2,
  productivityScore: 85,
  totalPublished: 15,
  winningContent: 4,
  winningPercentage: 26.6,
  notWinningContent: 5,
  activeTechnicalIssues: 2
};

export const monitoringData = Array.from({ length: 20 }, (_, i) => {
  const day = (i % 28) + 1; // 1 to 28
  let week = "";
  if (day <= 7) week = "Week 1 (1-7)";
  else if (day <= 14) week = "Week 2 (8-14)";
  else if (day <= 21) week = "Week 3 (15-21)";
  else week = "Week 4 (22-31)";

  const executors = ["Ian", "Udin", "Sani", "Ujank", "Abing"];
  const pics = ["Kiki (Adv)", "Munif (Skripter)", "Brili (Skripter)"];
  const products = ["Produk A", "Produk B", "Produk C", "Produk D"];
  const types = ["Gambar", "Video", "Landing Page"];
  const funnels = ["Cold", "Warm", "Hot"];
  const ratios = ["1:1", "4:5", "9:16"];

  return {
    id: i + 1,
    week: week,
    produk: products[i % products.length],
    linkKonten: `https://drive.google.com/file/d/dummy-link-${i + 1}`,
    tanggalKonten: `2026-06-${day.toString().padStart(2, '0')}`,
    judulKonten: `Ide Konten Kreatif ${types[i % types.length]} - Part ${i + 1}`,
    jenisKonten: types[i % types.length],
    ratio: ratios[i % ratios.length],
    funnel: funnels[i % funnels.length],
    executorCWM: executors[i % executors.length],
    picKonten: pics[i % pics.length],
    status: i < 12 ? "Selesai" : i < 17 ? "Proses" : "Belum Mulai",
  };
});

export const contentPerformance = Array.from({ length: 12 }, (_, i) => {
  const funnels = ["Cold", "Warm", "Hot"];
  const ratios = ["1:1", "4:5", "9:16"];
  const clicks = Math.floor(Math.random() * 500) + 50;
  const impressions = clicks * (Math.floor(Math.random() * 50) + 10); // Better realistic CTR
  const transactions = Math.floor(Math.random() * (clicks / 10)) + 1;
  return {
    id: i + 1,
    title: `Konten Marketing ${i + 1}`,
    funnel: funnels[i % 3],
    ratio: ratios[i % 3],
    impressions: impressions,
    clicks: clicks,
    transactions: transactions,
    get ctr() { return ((this.clicks / this.impressions) * 100).toFixed(2) },
    get conversionRate() { return ((this.transactions / this.clicks) * 100).toFixed(2) },
    roas: (Math.random() * 5 + 1).toFixed(2)
  };
});

export const winningContent = contentPerformance.slice(0, 3);
export const notWinningContent = contentPerformance.slice(4, 8);

export const technicalIssues = [
  { id: 1, issue: "Website Lambat", status: "Sedang Ditangani", severity: "Tinggi" },
  { id: 2, issue: "Plugin SEO Error", status: "Selesai", severity: "Sedang" },
  { id: 3, issue: "Gagal Upload Gambar", status: "Selesai", severity: "Rendah" },
  { id: 4, issue: "Server Down", status: "Selesai", severity: "Kritis" },
  { id: 5, issue: "Akses Akun Terkunci", status: "Menunggu Pihak Lain", severity: "Tinggi" }
];

// Data untuk Grafik Produktivitas (Recharts)
export const chartData = [
  { name: 'Senin', target: 5, realisasi: 4 },
  { name: 'Selasa', target: 5, realisasi: 5 },
  { name: 'Rabu', target: 5, realisasi: 6 },
  { name: 'Kamis', target: 5, realisasi: 4 },
  { name: 'Jumat', target: 5, realisasi: 5 },
  { name: 'Sabtu', target: 2, realisasi: 2 },
  { name: 'Minggu', target: 0, realisasi: 0 },
];
