import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  TrendingUp, Clock, CheckCircle, AlertCircle, 
  ArrowUpRight, Download, Calendar, Plus, Sparkles, X, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [aiInsight, setAiInsight] = useState("Analyzing your spending patterns...");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('/api/expenses/my');
      setExpenses(res.data);
      if (res.data.length > 0) fetchAiInsight(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsight = async (data) => {
    try {
      const summary = data.map(e => `${e.amount} ${e.currency} on ${e.category}`).join(', ');
      const res = await axios.post('/api/chat', { 
        message: `Analyze this expense summary and give a one-sentence friendly tip: ${summary}` 
      });
      setAiInsight(res.data.response);
    } catch (e) {
      setAiInsight("Keep it up! Submit more receipts for personalized smart insights.");
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + (curr.convertedAmount || 0), 0);
  const pendingCount = expenses.filter(e => e.status === 'PENDING').length;
  const approvedCount = expenses.filter(e => e.status === 'APPROVED').length;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div 
        className="bg-overlay" 
        style={{ 
          backgroundImage: `url('/images/dashboard_bg.png')`,
          opacity: 0.6
        }} 
      />

      <div className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="heading-accent" 
            style={{ fontSize: '2.5rem' }}
          >
            Welcome, {user?.name ? user.name.split(' ')[0] : 'User'}
          </motion.h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '1.1rem' }}>Here's what's happening with your expenses today.</p>
        </div>
        <Link to="/submit">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary" 
            style={{ padding: '16px 32px' }}
          >
            <Plus size={20} />
            New Reimbursement
          </motion.button>
        </Link>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="bento-grid"
      >
        <motion.div variants={item} className="glass bento-item" style={{ gridColumn: 'span 2', gridRow: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>TOTAL REIMBURSED</span>
              <div style={{ padding: '8px', borderRadius: '12px', background: 'var(--accent-light)', color: 'var(--accent-primary)' }}>
                <TrendingUp size={24} />
              </div>
            </div>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '8px' }}>
              {expenses[0]?.companyCurrency || 'USD'} {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#059669', fontWeight: 'bold' }}>
              <ArrowUpRight size={18} />
              <span>+12.5% from last month</span>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Sparkles size={20} color="var(--accent-primary)" />
              <strong style={{ fontSize: '0.9rem' }}>Smart Spending Advisor</strong>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.4' }}>
              "{aiInsight}"
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass bento-item" style={{ background: '#fef3c7' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <Clock size={32} color="#92400e" />
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#92400e' }}>{pendingCount}</div>
              <div style={{ color: '#92400e', fontWeight: '600', fontSize: '0.9rem' }}>Pending Requests</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass bento-item" style={{ background: '#d1fae5' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <CheckCircle size={32} color="#065f46" />
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#065f46' }}>{approvedCount}</div>
              <div style={{ color: '#065f46', fontWeight: '600', fontSize: '0.9rem' }}>Settled This Year</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: '48px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Sparkles size={24} color="var(--accent-hover)" />
             Interconnected Expense History
           </h3>
           <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
             Tracking {expenses.length} Smart Requests
           </div>
        </div>

        <div className="glass card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: '0' }}>
              <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '800' }}>EMPLOYEE</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '800' }}>DESCRIPTION</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '800' }}>DATE</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '800' }}>CATEGORY</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '800' }}>PAID BY</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '800' }}>AMOUNT</th>
                  <th style={{ padding: '20px 24px', textAlign: 'center', fontWeight: '800' }}>STATUS</th>
                  <th style={{ padding: '20px 24px', textAlign: 'right', fontWeight: '800' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No expenses submitted yet. Start by clicking "New Reimbursement".
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp, idx) => (
                    <tr key={exp._id || idx} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontWeight: '700' }}>{user?.name}</div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                         <div style={{ fontSize: '0.95rem' }}>{exp.description}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {exp._id?.slice(-8).toUpperCase()}</div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          {new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px', background: 'var(--accent-light)', color: 'var(--accent-hover)', fontWeight: '700' }}>
                          {exp.category}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', fontSize: '0.9rem' }}>
                         {user?.companyId?.name || "The Enterprise"}
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                         <div style={{ fontWeight: '800', fontSize: '1rem' }}>{exp.currency} {exp.amount.toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                         <span className={`status-badge ${exp.status.toLowerCase()}`}>
                           {exp.status}
                         </span>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                         <button 
                           onClick={() => setSelectedExpense(exp)}
                           style={{ background: 'var(--text-main)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem' }}
                         >
                           View Logs
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedExpense && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="glass card" 
               style={{ maxWidth: '600px', width: '100%', padding: '40px', position: 'relative' }}
             >
                <button onClick={() => setSelectedExpense(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent' }}>
                  <X size={24} />
                </button>
                <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Interconnected Audit</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Tracking flow for {selectedExpense.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                   <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                      <div style={{ padding: '10px', background: 'var(--accent-primary)', borderRadius: '12px', color: 'white', zIndex: 2 }}>
                         <CheckCircle size={20} />
                      </div>
                      <div style={{ position: 'absolute', left: '19px', top: '40px', bottom: '-24px', width: '2px', background: 'var(--border)', zIndex: 1 }}></div>
                      <div>
                         <div style={{ fontWeight: '800', fontSize: '1rem' }}>Submitted for Approval</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(selectedExpense.createdAt).toLocaleString()}</div>
                         <p style={{ marginTop: '4px', fontSize: '0.85rem' }}>Request of {selectedExpense.currency} {selectedExpense.amount} initiated by {user?.name}.</p>
                      </div>
                   </div>
                   {selectedExpense.approvals.map((app, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                         <div style={{ 
                           padding: '10px', 
                           background: app.status === 'APPROVED' ? '#059669' : app.status === 'REJECTED' ? '#ef4444' : 'var(--border)', 
                           borderRadius: '12px', color: 'white', zIndex: 2 
                         }}>
                            {app.status === 'APPROVED' ? <Check size={20} /> : app.status === 'REJECTED' ? <X size={20} /> : <div style={{width: 20, height: 20}} />}
                         </div>
                         {idx < selectedExpense.approvals.length - 1 && (
                            <div style={{ position: 'absolute', left: '19px', top: '40px', bottom: '-24px', width: '2px', background: 'var(--border)', zIndex: 1 }}></div>
                         )}
                         <div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                               <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>Stage {app.step}: {app.status}</span>
                            </div>
                            {app.approvedAt && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actioned on {new Date(app.approvedAt).toLocaleString()}</div>}
                            <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                              "{app.comment || (app.status === 'PENDING' ? 'Waiting for interconnected decision...' : app.status === 'WAITING' ? 'Awaiting previous stage completion.' : 'Processed.')}"
                            </p>
                         </div>
                      </div>
                   ))}
                   {selectedExpense.status === 'APPROVED' && (
                     <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                        <div style={{ padding: '10px', background: '#059669', borderRadius: '12px', color: 'white' }}>
                           <Sparkles size={20} />
                        </div>
                        <div>
                           <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#059669' }}>Governance Cleared</div>
                           <p style={{ fontSize: '0.85rem' }}>This reimbursement is fully approved and settled.</p>
                        </div>
                     </div>
                   )}
                </div>
                <button onClick={() => setSelectedExpense(null)} className="btn-primary" style={{ width: '100%', marginTop: '40px' }}>
                  Close Audit View
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 100 }}
      >
        {/* Chatbot trigger can go here, but it's in Layout.jsx already */}
      </motion.div>
    </div>
  );
}
