import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Users, UserPlus, RefreshCcw, Save, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
     name: '', email: '', password: '', role: 'EMPLOYEE', managerId: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingId(user._id);
    setEditFormData({ role: user.role, managerId: user.managerId || '' });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/api/users/${id}`, editFormData);
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', newUserData);
      setShowAddModal(false);
      setNewUserData({ name: '', email: '', password: '', role: 'EMPLOYEE', managerId: '' });
      fetchUsers();
    } catch (err) {
      alert("Creation failed: " + (err.response?.data?.message || err.message));
    }
  };

  const roles = ["ADMIN", "MANAGER", "EMPLOYEE", "FINANCE", "DIRECTOR"];

  // Possible manager candidates (excluding current editing user or employees?) - typically managers or directors
  const managerCandidates = users.filter(u => u.role !== 'EMPLOYEE');

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header responsive-flex" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading-accent" style={{ fontSize: '2.5rem' }}>Interconnected User Directory</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage roles, hierarchies and interconnected functionalities.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '14px 28px', width: '100%', maxWidth: 'max-content' }}>
          <UserPlus size={20} /> Add New User
        </button>
      </div>

      <div className="glass card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '24px', textAlign: 'left', fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)' }}>MEMBER</th>
              <th style={{ padding: '24px', textAlign: 'left', fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ROLE / ACCESS</th>
              <th style={{ padding: '24px', textAlign: 'left', fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)' }}>REPORTING TO</th>
              <th style={{ padding: '24px', textAlign: 'right', fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }}>
                <td style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--accent-light)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserIcon size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>{u.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '24px' }}>
                  {editingId === u._id ? (
                    <select 
                      value={editFormData.role} 
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className={`status-badge ${u.role.toLowerCase()}`} style={{ fontWeight: '700' }}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td style={{ padding: '24px' }}>
                  {editingId === u._id ? (
                    <select 
                      value={editFormData.managerId} 
                      onChange={(e) => setEditFormData({ ...editFormData, managerId: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    >
                      <option value="">No Manager</option>
                      {users.filter(cand => cand._id !== u._id).map(cand => (
                        <option key={cand._id} value={cand._id}>{cand.name} ({cand.role})</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={16} color="var(--text-muted)" />
                      {users.find(mgr => mgr._id === u.managerId)?.name || 'Direct Entry'}
                    </div>
                  )}
                </td>
                <td style={{ padding: '24px', textAlign: 'right' }}>
                   {editingId === u._id ? (
                     <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                       <button onClick={() => handleUpdate(u._id)} style={{ padding: '10px 16px', borderRadius: '10px', background: '#059669', color: 'white' }}>
                         <Save size={18} />
                       </button>
                       <button onClick={() => setEditingId(null)} style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--border)' }}>
                         <X size={18} />
                       </button>
                     </div>
                   ) : (
                     <button onClick={() => handleEditClick(u)} style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--accent-primary)', fontWeight: '700' }}>
                       Manage Access
                     </button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass card" 
            style={{ maxWidth: '500px', width: '100%', padding: '40px' }}
          >
            <h2 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Onboard New Member</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="label-accent">FULL NAME</label>
                <input required value={newUserData.name} onChange={(e) => setNewUserData({...newUserData, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div>
                <label className="label-accent">EMAIL ADDRESS</label>
                <input required type="email" value={newUserData.email} onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} placeholder="john@company.com" />
              </div>
              <div>
                <label className="label-accent">TEMPORARY PASSWORD</label>
                <input required type="password" value={newUserData.password} onChange={(e) => setNewUserData({...newUserData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                    <label className="label-accent">ROLE</label>
                    <select value={newUserData.role} onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="label-accent">DIRECT MANAGER</label>
                    <select value={newUserData.managerId} onChange={(e) => setNewUserData({...newUserData, managerId: e.target.value})}>
                       <option value="">Select Manager</option>
                       {users.map(mgr => <option key={mgr._id} value={mgr._id}>{mgr.name} ({mgr.role})</option>)}
                    </select>
                 </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Onboard User</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
