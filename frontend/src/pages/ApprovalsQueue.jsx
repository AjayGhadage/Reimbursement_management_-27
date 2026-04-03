import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, FileText, ChevronRight, Clock, DollarSign, User } from 'lucide-react';

export default function ApprovalsQueue() {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/api/expenses/approvals');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (expenseId, action) => {
    try {
      await api.post(`/api/expenses/${expenseId}/approve`, { status: action, comment });
      fetchPending();
      setSelectedExpense(null);
      setComment('');
    } catch (err) {
      console.error("❌ Action Error:", err);
      alert(err.response?.data?.message || err.response?.data?.error || err.message || "Action failed.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <h1 className="heading-accent" style={{ fontSize: '2.5rem' }}>Approvals Center</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Review and manage pending reimbursement requests from your team.</p>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: selectedExpense ? '1fr 1fr' : '1fr', gap: '32px', transition: 'all 0.4s' }}>
        
        {/* List View */}
        <div className="glass bento-item" style={{ padding: '32px' }}>
          <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={20} color="var(--accent-primary)" />
              Pending Verification ({expenses.length})
            </h3>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr 
                    key={exp._id} 
                    onClick={() => setSelectedExpense(exp)}
                    style={{ 
                      cursor: 'pointer',
                      background: selectedExpense?._id === exp._id ? 'rgba(0,0,0,0.03)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--accent-light)', color: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={14} />
                        </div>
                        <span style={{ fontWeight: '600' }}>{exp.createdBy?.name || "Team Member"}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>{exp.category}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                          STAGE {exp.approvals?.find(a => a.status === 'PENDING')?.step || '?'} PENDING
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '700' }}>{exp.amount} {exp.currency}</td>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td><ChevronRight size={18} color="var(--text-muted)" /></td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                      <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                      <p>Inbox Cleared! All caught up.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedExpense && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="glass bento-item" 
              style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', border: '2px solid var(--accent-primary)' }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>Review Request</h3>
                  <button onClick={() => setSelectedExpense(null)} style={{ background: 'transparent' }}><ChevronRight style={{ transform: 'rotate(90deg)' }} /></button>
               </div>

               <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="card" style={{ padding: '20px', background: 'rgba(255,255,255,0.4)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>SUBMITTED AMOUNT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedExpense.amount} {selectedExpense.currency}</div>
                  </div>
                  <div className="card" style={{ padding: '20px', background: 'var(--accent-light)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '4px' }}>CONVERTED TOTAL</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#92400e' }}>{selectedExpense.companyCurrency} {selectedExpense.convertedAmount.toFixed(2)}</div>
                  </div>
               </div>

               <div>
                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>JUSTIFICATION / REMARKS</label>
                 <div style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', fontStyle: 'italic', lineHeight: '1.6' }}>
                   "{selectedExpense.remarks || selectedExpense.description}"
                 </div>
               </div>

               <div>
                 <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>WORKFLOW HISTORY (INTERCONNECTED)</label>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {selectedExpense.approvals?.filter(a => a.status !== 'WAITING' && a.status !== 'PENDING').map((a, idx) => (
                      <div key={idx} style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', fontSize: '0.85rem', borderLeft: `4px solid ${a.status === 'APPROVED' ? '#22c55e' : '#ef4444'}` }}>
                        <div style={{ fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Stage {a.step} Result</span>
                          <span style={{ color: a.status === 'APPROVED' ? '#166534' : '#991b1b' }}>{a.status}</span>
                        </div>
                        <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>{a.comment || 'Approved without additional comments.'}</p>
                      </div>
                    ))}
                    {(!selectedExpense.approvals || selectedExpense.approvals.filter(a => a.status !== 'PENDING').length === 0) && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Initial stage: Waiting for first review.</p>
                    )}
                 </div>

                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ADD YOUR COMMENT (OPTIONAL)</label>
                 <textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide context for your decision..."
                    rows="3"
                    style={{ resize: 'none' }}
                 />
               </div>

               <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleAction(selectedExpense._id, 'REJECTED')}
                    className="btn-secondary" 
                    style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction(selectedExpense._id, 'APPROVED')}
                    className="btn-primary" 
                    style={{ flex: 2 }}
                  >
                    <CheckCircle size={18} /> Approve Release
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
