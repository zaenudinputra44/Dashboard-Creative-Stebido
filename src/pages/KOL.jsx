import React, { useState, useEffect } from 'react';
import { teamData } from '../data/dummyData';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiExternalLink, FiX, FiUsers, FiDollarSign, FiDownload, FiCheckSquare, FiSquare } from 'react-icons/fi';
import '../tables.css';

const KOL = () => {
  const [data, setData] = useState([]); // for META & MARKETPLACE
  const [tiktokData, setTiktokData] = useState([]); // for TIKTOK
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [activePlatform, setActivePlatform] = useState('META');
  const [teamMembers, setTeamMembers] = useState(teamData);

  const fetchData = () => {
    // Fetch normal data
    fetch('/api/kol')
      .then(res => res.ok ? res.json() : [])
      .then(dbData => {
        setData(dbData);
        setIsLoading(false);
      })
      .catch(err => {
        setData([]);
        setIsLoading(false);
      });

    // Fetch TikTok data
    fetch('/api/kol-tiktok')
      .then(res => res.ok ? res.json() : [])
      .then(tData => {
        setTiktokData(tData);
      })
      .catch(err => console.warn('Gagal memuat data TikTok', err));
  };

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.ok ? res.json() : [])
      .then(users => {
        if (Array.isArray(users) && users.length > 0) {
          setTeamMembers(users);
        }
      })
      .catch(err => console.warn('Gagal memuat data tim', err));
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({});

  // Filter Logic
  const getFilteredData = () => {
    let sourceData = activePlatform === 'TIKTOK' ? tiktokData : data.filter(item => (item.platform || 'META') === activePlatform);
    
    return sourceData.filter(item => {
      // Search logic differs slightly between schemas
      let searchString = '';
      if (activePlatform === 'TIKTOK') {
        searchString = `${item.nama_talent || ''} ${item.link_akun_tiktok || ''} ${item.notes || ''}`.toLowerCase();
      } else {
        searchString = `${item.nama_produk || ''} ${item.nama_akun || ''} ${item.pic_kol || ''}`.toLowerCase();
      }
      
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (filterMonth !== 'All' || filterYear !== 'All') {
        const dateStr = item.tanggal || item.created_at || '';
        if (dateStr) {
          const dateObj = new Date(dateStr);
          if (filterYear !== 'All' && dateObj.getFullYear().toString() !== filterYear) matchesDate = false;
          if (filterMonth !== 'All' && (dateObj.getMonth() + 1).toString().padStart(2, '0') !== filterMonth) matchesDate = false;
        }
      }

      return matchesSearch && matchesDate;
    });
  };

  const filteredData = getFilteredData();

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      const formattedDate = item.tanggal ? new Date(item.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      setFormData({ ...item, tanggal: formattedDate });
    } else {
      setEditingItem(null);
      
      if (activePlatform === 'TIKTOK') {
        setFormData({
          tanggal: new Date().toISOString().split('T')[0],
          nama_talent: '',
          kategori_talent: 'Macro',
          link_akun_tiktok: '',
          ratecard: '',
          keterangan_sow: '',
          periode_owning: 'Selamanya',
          acc_kerjasama: false,
          notes: '',
          rc_foto: ''
        });
      } else {
        setFormData({
          tanggal: new Date().toISOString().split('T')[0],
          nama_produk: '',
          pic_kol: '',
          nama_akun: '',
          tingkat_kategori: 'Micro (10K-100K)',
          no_whatsapp: '',
          tipe: 'Short & Reels',
          ratecard: '',
          link_ig: '',
          link_gdrive: '',
          link_upload_reels: '',
          link_upload_story: '',
          all_upload: false,
          diiklankan: false,
          kategori: 'endors_stebido',
          platform: activePlatform
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
    else if (name === 'ratecard') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } 
    else if (name === 'no_whatsapp') {
      let val = value.trim();
      if (/^(\+62|62|0)[0-9]{8,13}$/.test(val)) {
        if (val.startsWith('0')) val = '62' + val.substring(1);
        if (val.startsWith('+')) val = val.substring(1);
        val = `https://wa.me/${val}`;
      }
      setFormData(prev => ({ ...prev, [name]: val }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const endpoint = activePlatform === 'TIKTOK' ? '/api/kol-tiktok' : '/api/kol';
    try {
      if (editingItem) {
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingItem.id })
        });
        if (!res.ok) throw new Error('Gagal update data');
        fetchData();
      } else {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Gagal menambah data');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      const endpoint = activePlatform === 'TIKTOK' ? '/api/kol-tiktok' : '/api/kol';
      try {
        const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus data');
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleInlineChange = async (item, field, newValue) => {
    const updatedItem = { ...item, [field]: newValue };
    
    if (activePlatform === 'TIKTOK') {
      setTiktokData(prev => prev.map(d => d.id === item.id ? updatedItem : d));
    } else {
      setData(prev => prev.map(d => d.id === item.id ? updatedItem : d));
    }

    const endpoint = activePlatform === 'TIKTOK' ? '/api/kol-tiktok' : '/api/kol';
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      if (!res.ok) throw new Error('Gagal update inline');
    } catch (err) {
      fetchData();
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
  };

  const getCategoryStyle = (category) => {
    if (!category) return {};
    const catLower = category.toLowerCase();
    if (catLower.includes('nano')) return { color: '#dc2626', backgroundColor: '#fecaca', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' };
    if (catLower.includes('micro')) return { color: '#2563eb', backgroundColor: '#bfdbfe', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' };
    if (catLower.includes('macro')) return { color: '#9a3412', backgroundColor: '#fed7aa', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' };
    return { color: '#4b5563', backgroundColor: '#e5e7eb', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' };
  };

  const handleExportExcel = async () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(`Data ${activePlatform}`);

      if (activePlatform === 'TIKTOK') {
        sheet.mergeCells('A1:J1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `Laporan Data KOL - TIKTOK`;
        titleCell.font = { size: 16, bold: true, color: { argb: 'FF374151' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.addRow([]);

        const headers = ["No", "Tanggal", "Nama talent", "Kategori Talent", "Link Akun Tiktok", "Ratecard", "Keterangan SOW", "Periode Owning", "Acc Kerjasama", "Notes", "RC Foto"];
        const headerRow = sheet.addRow(headers);
        headerRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEA00' } };
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        sheet.columns = [
          { width: 5 }, { width: 15 }, { width: 25 }, { width: 20 }, { width: 35 }, 
          { width: 18 }, { width: 40 }, { width: 20 }, { width: 15 }, { width: 30 }, { width: 15 }
        ];

        filteredData.forEach((item, index) => {
          const row = sheet.addRow([
            index + 1,
            item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-',
            item.nama_talent || '-',
            item.kategori_talent || '-',
            item.link_akun_tiktok || '-',
            Number(item.ratecard || 0),
            item.keterangan_sow || '-',
            item.periode_owning || '-',
            item.acc_kerjasama ? 'Y' : 'N',
            item.notes || '-',
            item.rc_foto || '-'
          ]);

          row.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (colNumber === 6) { cell.numFmt = '"Rp"#,##0'; } // Ratecard
          });
        });
      } else {
        // META or others
        sheet.mergeCells('A1:O1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `Laporan Data KOL - ${activePlatform}`;
        titleCell.font = { size: 16, bold: true, color: { argb: 'FF374151' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.addRow([]);

        const headers = ["No.", "Tanggal", "Nama Produk", "KOL", "Nama Akun", "Category", "No. Whatsapp", "Type", "Ratecard", "Link IG", "Link GDrive", "Link Upload IG (Reels)", "Link Upload Story (IGS)", "All Upload", "DIIKLANKAN"];
        const headerRow = sheet.addRow(headers);
        headerRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEA00' } };
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        sheet.columns = [
          { width: 5 }, { width: 15 }, { width: 20 }, { width: 15 }, { width: 25 }, { width: 20 },
          { width: 20 }, { width: 15 }, { width: 18 }, { width: 25 }, { width: 25 }, 
          { width: 25 }, { width: 25 }, { width: 12 }, { width: 12 }
        ];

        filteredData.forEach((item, index) => {
          const row = sheet.addRow([
            index + 1,
            item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-',
            item.nama_produk || '-',
            item.pic_kol || '-',
            item.nama_akun || '-',
            item.tingkat_kategori || '-',
            item.no_whatsapp || '-',
            item.tipe || '-',
            Number(item.ratecard || 0),
            item.link_ig || '-',
            item.link_gdrive || '-',
            item.link_upload_reels || '-',
            item.link_upload_story || '-',
            item.all_upload ? 'Y' : 'N',
            item.diiklankan ? 'Y' : 'N'
          ]);

          row.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (colNumber === 9) { cell.numFmt = '"Rp"#,##0'; }
          });
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_KOL_${activePlatform}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal export excel", err);
      alert("Gagal melakukan export file Excel.");
    }
  };

  const totalActiveKol = filteredData.length;
  const totalBudgetSpent = filteredData.reduce((acc, curr) => acc + (parseFloat(curr.ratecard) || 0), 0);
  
  // Only applicable for META for 'diiklankan', for Tiktok maybe 'acc_kerjasama'
  const totalDiiklankan = activePlatform === 'TIKTOK' 
    ? filteredData.filter(item => item.acc_kerjasama).length 
    : filteredData.filter(item => item.diiklankan).length;

  const renderLink = (url) => {
    if (!url || url === '-') return '-';
    const href = url.startsWith('http') || url.startsWith('wa.me') ? (url.startsWith('wa.me') ? `https://${url}` : url) : `https://${url}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem', backgroundColor: 'var(--bg-color)', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
        Buka <FiExternalLink />
      </a>
    );
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h2>Divisi KOL (Influencer)</h2>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>Pantau kerjasama, jenis tayang, dan progress upload influencer.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}>
            <FiDownload /> Export Excel
          </button>
          <button className="action-btn" onClick={() => handleOpenModal()}>
            <FiPlus /> Tambah KOL {activePlatform}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {['META', 'TIKTOK', 'MARKETPLACE'].map(plat => (
          <button 
            key={plat}
            onClick={() => setActivePlatform(plat)}
            style={{ background: 'none', border: 'none', borderBottom: activePlatform === plat ? '2px solid var(--primary-color)' : 'none', color: activePlatform === plat ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activePlatform === plat ? '600' : 'normal', padding: '0.5rem 0', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '1rem', transition: 'all 0.2s' }}
          >
            {plat}
          </button>
        ))}
      </div>

      <div className="kpi-grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary-color)' }}>
            <FiUsers size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total KOL {activePlatform}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>{totalActiveKol}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--success-color)' }}>
            <FiDollarSign size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Ratecard (Budget)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{formatRupiah(totalBudgetSpent)}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '1rem', borderRadius: '12px', color: '#eab308' }}>
            <FiCheckSquare size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{activePlatform === 'TIKTOK' ? 'Acc Kerjasama' : 'Konten Diiklankan'}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>{totalDiiklankan}</div>
          </div>
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="search-box" style={{ flex: '1' }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder={activePlatform === 'TIKTOK' ? "Cari Nama Talent atau Link Akun..." : "Cari Nama Produk, Akun, atau KOL..."}
            className="filter-input pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
          <option value="All">Semua Bulan</option>
          <option value="01">Januari</option>
          <option value="02">Februari</option>
          <option value="03">Maret</option>
          <option value="04">April</option>
          <option value="05">Mei</option>
          <option value="06">Juni</option>
          <option value="07">Juli</option>
          <option value="08">Agustus</option>
          <option value="09">September</option>
          <option value="10">Oktober</option>
          <option value="11">November</option>
          <option value="12">Desember</option>
        </select>
        <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
          <option value="All">Semua Tahun</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        {activePlatform === 'TIKTOK' ? (
          <table className="data-table" style={{ minWidth: '1600px' }}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama talent</th>
                <th>Kategori Talent</th>
                <th style={{textAlign: 'center'}}>Link Akun Tiktok</th>
                <th>Ratecard</th>
                <th>Keterangan SOW</th>
                <th style={{textAlign: 'center'}}>Periode Owning</th>
                <th style={{textAlign: 'center'}}>Acc Kerjasama</th>
                <th>Notes</th>
                <th style={{textAlign: 'center'}}>RC Foto</th>
                <th style={{textAlign: 'center', position: 'sticky', right: 0, backgroundColor: 'var(--bg-color)', zIndex: 1}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                  </td>
                  <td className="font-medium" style={{ color: 'var(--text-main)' }}>{item.nama_talent || '-'}</td>
                  <td>
                    <span style={getCategoryStyle(item.kategori_talent)}>{item.kategori_talent || '-'}</span>
                  </td>
                  <td style={{textAlign: 'center'}}>{renderLink(item.link_akun_tiktok)}</td>
                  <td style={{ fontWeight: '600' }}>{formatRupiah(item.ratecard)}</td>
                  <td><div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.keterangan_sow}>{item.keterangan_sow || '-'}</div></td>
                  <td style={{textAlign: 'center'}}>
                    <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {item.periode_owning || '-'}
                    </span>
                  </td>
                  <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                    <div style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={() => handleInlineChange(item, 'acc_kerjasama', !item.acc_kerjasama)}>
                      {item.acc_kerjasama ? <FiCheckSquare size={22} color="var(--success-color)" /> : <FiSquare size={22} color="var(--border-color)" />}
                    </div>
                  </td>
                  <td><div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.notes}>{item.notes || '-'}</div></td>
                  <td style={{textAlign: 'center', fontWeight: '500', color: 'var(--primary-color)'}}>{item.rc_foto || '-'}</td>
                  
                  <td style={{textAlign: 'center', position: 'sticky', right: 0, backgroundColor: 'var(--bg-color)', zIndex: 1, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)'}}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button style={{ color: 'var(--text-muted)' }} onClick={() => handleOpenModal(item)} title="Edit"><FiEdit2 /></button>
                      <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDelete(item.id)} title="Hapus"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem' }}>Belum ada data untuk TIKTOK.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table" style={{ minWidth: '1600px' }}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Produk</th>
                <th>KOL (PIC)</th>
                <th>Nama Akun</th>
                <th>Category</th>
                <th style={{textAlign: 'center'}}>No. Whatsapp</th>
                <th style={{textAlign: 'center'}}>Type</th>
                <th>Ratecard</th>
                <th style={{textAlign: 'center'}}>Link IG</th>
                <th style={{textAlign: 'center'}}>Link GDrive</th>
                <th style={{textAlign: 'center'}}>Link Upload IG (Reels)</th>
                <th style={{textAlign: 'center'}}>Link Upload Story (IGS)</th>
                <th style={{textAlign: 'center'}}>All Upload</th>
                <th style={{textAlign: 'center'}}>DIIKLANKAN</th>
                <th style={{textAlign: 'center', position: 'sticky', right: 0, backgroundColor: 'var(--bg-color)', zIndex: 1}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                  </td>
                  <td className="font-medium" style={{ color: 'var(--text-main)' }}>{item.nama_produk || '-'}</td>
                  <td>{item.pic_kol || '-'}</td>
                  <td style={{ fontWeight: '500' }}>{item.nama_akun || '-'}</td>
                  <td>
                    <span style={getCategoryStyle(item.tingkat_kategori)}>{item.tingkat_kategori || '-'}</span>
                  </td>
                  <td style={{textAlign: 'center'}}>{renderLink(item.no_whatsapp)}</td>
                  <td style={{textAlign: 'center'}}>
                    <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {item.tipe || '-'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{formatRupiah(item.ratecard)}</td>
                  <td style={{textAlign: 'center'}}>{renderLink(item.link_ig)}</td>
                  <td style={{textAlign: 'center'}}>{renderLink(item.link_gdrive)}</td>
                  <td style={{textAlign: 'center'}}>{renderLink(item.link_upload_reels)}</td>
                  <td style={{textAlign: 'center'}}>{renderLink(item.link_upload_story)}</td>
                  
                  <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                    <div style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={() => handleInlineChange(item, 'all_upload', !item.all_upload)}>
                      {item.all_upload ? <FiCheckSquare size={22} color="var(--success-color)" /> : <FiSquare size={22} color="var(--border-color)" />}
                    </div>
                  </td>
                  
                  <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                    <div style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={() => handleInlineChange(item, 'diiklankan', !item.diiklankan)}>
                      {item.diiklankan ? <FiCheckSquare size={22} color="var(--primary-color)" /> : <FiSquare size={22} color="var(--border-color)" />}
                    </div>
                  </td>
                  
                  <td style={{textAlign: 'center', position: 'sticky', right: 0, backgroundColor: 'var(--bg-color)', zIndex: 1, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)'}}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button style={{ color: 'var(--text-muted)' }} onClick={() => handleOpenModal(item)} title="Edit"><FiEdit2 /></button>
                      <button style={{ color: 'var(--danger-color)' }} onClick={() => handleDelete(item.id)} title="Hapus"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="15" style={{ textAlign: 'center', padding: '3rem' }}>Belum ada data.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ padding: '1rem' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>{editingItem ? `Edit Data ${activePlatform}` : `Tambah Data ${activePlatform}`}</h3>
              <button className="modal-close" onClick={handleCloseModal}><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form" style={{ overflowY: 'auto' }}>
              <div className="form-group">
                <label>Tanggal</label>
                <input type="date" name="tanggal" value={formData.tanggal} onChange={handleInputChange} className="login-input" required />
              </div>

              {activePlatform === 'TIKTOK' ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama Talent</label>
                      <input type="text" name="nama_talent" value={formData.nama_talent} onChange={handleInputChange} className="login-input" placeholder="Nama Talent" />
                    </div>
                    <div className="form-group">
                      <label>Kategori Talent</label>
                      <select name="kategori_talent" value={formData.kategori_talent} onChange={handleInputChange} className="login-input">
                        <option value="Nano">Nano</option>
                        <option value="Micro">Micro</option>
                        <option value="Macro">Macro</option>
                        <option value="Mega">Mega</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Link Akun Tiktok</label>
                      <input type="url" name="link_akun_tiktok" value={formData.link_akun_tiktok} onChange={handleInputChange} className="login-input" placeholder="https://www.tiktok.com/@..." />
                    </div>
                    <div className="form-group">
                      <label>Ratecard (Rp)</label>
                      <input type="text" name="ratecard" value={new Intl.NumberFormat('id-ID').format(formData.ratecard || 0)} onChange={handleInputChange} className="login-input" placeholder="0" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Keterangan SOW</label>
                    <input type="text" name="keterangan_sow" value={formData.keterangan_sow} onChange={handleInputChange} className="login-input" placeholder="Contoh: VT + Owning + Keranjang Kuning" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Periode Owning</label>
                      <select name="periode_owning" value={formData.periode_owning} onChange={handleInputChange} className="login-input">
                        <option value="1 Bulan">1 Bulan</option>
                        <option value="2 Bulan">2 Bulan</option>
                        <option value="3 Bulan">3 Bulan</option>
                        <option value="6 Bulan">6 Bulan</option>
                        <option value="1 Tahun">1 Tahun</option>
                        <option value="Selamanya">Selamanya (Owning)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>RC Foto</label>
                      <input type="text" name="rc_foto" value={formData.rc_foto} onChange={handleInputChange} className="login-input" placeholder="Contoh: 500k atau free" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="login-input" placeholder="Catatan tambahan..." rows="2"></textarea>
                  </div>

                  <div className="form-row mt-2" style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <input type="checkbox" name="acc_kerjasama" checked={formData.acc_kerjasama} onChange={handleInputChange} style={{ width: '20px', height: '20px' }} id="check-acc" />
                      <label htmlFor="check-acc" style={{ marginBottom: 0, fontWeight: 'bold' }}>Acc Kerjasama</label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama Produk</label>
                      <input type="text" name="nama_produk" value={formData.nama_produk} onChange={handleInputChange} className="login-input" placeholder="Contoh: Herbavomitz" />
                    </div>
                    <div className="form-group">
                      <label>KOL (PIC)</label>
                      <select name="pic_kol" value={formData.pic_kol} onChange={handleInputChange} className="login-input">
                        <option value="">-- Pilih PIC --</option>
                        {teamMembers.map(user => (
                          <option key={user.id} value={user.name}>{user.name}</option>
                        ))}
                        {formData.pic_kol && !teamMembers.some(u => u.name === formData.pic_kol) && (
                          <option value={formData.pic_kol}>{formData.pic_kol}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama Akun (Username)</label>
                      <input type="text" name="nama_akun" value={formData.nama_akun} onChange={handleInputChange} className="login-input" placeholder="Contoh: Wahyu Devi Intan Sari" />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select name="tingkat_kategori" value={formData.tingkat_kategori} onChange={handleInputChange} className="login-input">
                        <option value="Nano (1K-10K)">Nano (1K-10K)</option>
                        <option value="Micro (10K-100K)">Micro (10K-100K)</option>
                        <option value="Macro (100K-1M)">Macro (100K-1M)</option>
                        <option value="Mega (>1M)">Mega (&gt;1M)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>No. Whatsapp</label>
                      <input type="text" name="no_whatsapp" value={formData.no_whatsapp} onChange={handleInputChange} className="login-input" placeholder="Otomatis jadi link jika memasukkan nomor" />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select name="tipe" value={formData.tipe} onChange={handleInputChange} className="login-input">
                        <option value="Short & Reels">Short & Reels</option>
                        <option value="Video Review">Video Review</option>
                        <option value="Short">Short</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ratecard (Rp)</label>
                    <input type="text" name="ratecard" value={new Intl.NumberFormat('id-ID').format(formData.ratecard || 0)} onChange={handleInputChange} className="login-input" placeholder="0" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Link IG</label>
                      <input type="url" name="link_ig" value={formData.link_ig} onChange={handleInputChange} className="login-input" placeholder="https://instagram.com/..." />
                    </div>
                    <div className="form-group">
                      <label>Link GDrive</label>
                      <input type="url" name="link_gdrive" value={formData.link_gdrive} onChange={handleInputChange} className="login-input" placeholder="https://drive.google.com/..." />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Link Upload IG (Reels)</label>
                      <input type="url" name="link_upload_reels" value={formData.link_upload_reels} onChange={handleInputChange} className="login-input" placeholder="https://..." />
                    </div>
                    <div className="form-group">
                      <label>Link Upload Story (IGS)</label>
                      <input type="url" name="link_upload_story" value={formData.link_upload_story} onChange={handleInputChange} className="login-input" placeholder="https://..." />
                    </div>
                  </div>

                  <div className="form-row mt-2" style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <input type="checkbox" name="all_upload" checked={formData.all_upload} onChange={handleInputChange} style={{ width: '20px', height: '20px' }} id="check-all" />
                      <label htmlFor="check-all" style={{ marginBottom: 0, fontWeight: 'bold' }}>All Upload</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <input type="checkbox" name="diiklankan" checked={formData.diiklankan} onChange={handleInputChange} style={{ width: '20px', height: '20px' }} id="check-iklankan" />
                      <label htmlFor="check-iklankan" style={{ marginBottom: 0, fontWeight: 'bold' }}>DIIKLANKAN</label>
                    </div>
                  </div>
                </>
              )}

              <div className="modal-actions mt-4">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="login-button mt-0" style={{ marginTop: 0 }}>Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KOL;
