import { useState, useEffect } from 'react';
import axios from 'axios';
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
      const res = await axios.get('/api/expenses/pending');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (expenseId, action) => {
    try {
      await axios.put(`/api/expenses/${expenseId}/approve`, { action, comment });
      fetchPending();
      setSelectedExpense(null);
      setComment('');
    } catch (err) {
      alert("Action failed. Try again later.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <h1 className="heading-accent" style={{ fontSize: '2.5rem' }}>Approvals Center</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Review and manage pending reimbursement requests from your team.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedExpense ? '1fr 1fr' : '1fr', gap: '32px', transition: 'all 0.4s' }}>
        
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
                        <span style={{ fontWeight: '600' }}>Team Member</span>
                      </div>
                    </td>
                    <td>{exp.category}</td>
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

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ADD COMMENT (OPTIONAL)</label>
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
