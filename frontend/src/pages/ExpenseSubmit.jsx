import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExpenseSubmit() {
  const [formData, setFormData] = useState({
    description: '',
    category: 'Travel',
    amount: '',
    currency: 'USD', 
    date: new Date().toISOString().slice(0, 10),
    remarks: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [receiptScanned, setReceiptScanned] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setLoading(true);
      setReceiptScanned(false);
      
      const file = acceptedFiles[0];
      const formDataML = new FormData();
      formDataML.append('file', file);

      try {
        const res = await axios.post('/ml/ocr', formDataML, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const data = res.data.parsed;
        if (data) {
          let formattedDate = data.date;
          if (formattedDate && /^\d{2}-\d{2}-\d{4}$/.test(formattedDate)) {
            const [d, m, y] = formattedDate.split('-');
            formattedDate = `${y}-${m}-${d}`;
          } else if (formattedDate) {
            formattedDate = formattedDate.slice(0, 10);
          }

          setFormData(prev => ({
            ...prev,
            description: data.description || prev.description,
            amount: data.amount || prev.amount,
            currency: data.currency || prev.currency,
            date: formattedDate || prev.date
          }));
          setReceiptScanned(true);
        }
      } catch (err) {
        console.error("OCR Error:", err);
        alert("Smart scan failed. Please enter details manually.");
      } finally {
        setLoading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*, .pdf' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/expenses', formData);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Unknown error";
      console.error("Submission error:", err.response?.data || err);
      alert(`Submission failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}
    >
      <div className="page-header" style={{ marginBottom: '32px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', padding: '0', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="heading-accent" style={{ fontSize: '2.5rem' }}>Submit Reimbursement</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Use our Smart scanner or fill manually to start your request.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', alignItems: 'start' }} className="bento-grid-mobile">
        
        {/* Upload Portal */}
        <motion.div 
          className="glass bento-item" 
          style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Sparkles size={24} color="var(--accent-primary)" />
             <h3 style={{ fontSize: '1.4rem' }}>Smart Receipt Scanner</h3>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Simply drop your receipt image here. Our system will automatically extract the amount, date, and category for you.
          </p>

          <div 
            {...getRootProps()} 
            style={{
              border: `2px dashed ${isDragActive ? 'var(--accent-primary)' : 'var(--border)'}`,
              borderRadius: '20px',
              padding: '60px 24px',
              textAlign: 'center',
              backgroundColor: isDragActive ? 'rgba(245, 158, 11, 0.05)' : 'rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <input {...getInputProps()} />
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--accent-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '1.1rem' }}>Smart Scanning...</span>
              </div>
            ) : receiptScanned ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '56px', height: '56px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={32} color="#059669" />
                </div>
                <span style={{ color: '#059669', fontWeight: '800' }}>Success! Data Extracted</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You can still edit fields below.</p>
              </div>
            ) : (
              <>
                <div style={{ width: '56px', height: '56px', background: 'var(--accent-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <UploadCloud size={28} color="var(--accent-primary)" />
                </div>
                <div>
                   <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Click to upload receipt
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    PNG, JPG or PDF up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', display: 'flex', gap: '12px' }}>
            <AlertCircle size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: '#1e40af', margin: 0 }}>
              Verify all extracted data before submission. Automated scanning can occasionally make mistakes with handwritten receipts.
            </p>
          </div>
        </motion.div>

        {/* Transaction Form */}
        <div className="glass bento-item" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem' }}>DESCRIPTION</label>
                <input name="description" value={formData.description} onChange={handleChange} required placeholder="What was this for?" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem' }}>CATEGORY</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option>Travel</option>
                  <option>Food & Dining</option>
                  <option>Software/SaaS</option>
                  <option>Office Hardware</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem' }}>TRANSACTION DATE</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem' }}>AMOUNT</label>
                  <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required placeholder="0.00" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem' }}>CURRENCY</label>
                  <select name="currency" value={formData.currency} onChange={handleChange}>
                    <option>USD</option>
                    <option>INR</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem' }}>NOTES / JUSTIFICATION</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Provide context for approval..." rows="4" style={{ resize: 'none' }}></textarea>
            </div>

            <div style={{ 
              background: 'linear-gradient(to right, #fef3c7, #fff)', 
              padding: '20px', borderRadius: '16px', borderLeft: '5px solid var(--accent-primary)' 
            }}>
              <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0, fontWeight: '500' }}>
                <strong>Currency Note:</strong> Our system uses live interbank rates. Your expense will be converted to your company's base currency ({formData.currency}) upon approval.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="btn-primary" style={{ padding: '16px 48px', fontSize: '1.1rem' }} disabled={loading}>
                {loading ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

      </div>
      
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .bento-grid-mobile { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}
