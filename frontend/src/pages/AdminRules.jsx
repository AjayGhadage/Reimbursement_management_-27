import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Settings, Plus, Trash2, ArrowRight, Check, AlertTriangle } from 'lucide-react';

export default function AdminRules() {
  const [rule, setRule] = useState({
    steps: [],
    ruleType: 'SEQUENTIAL',
    percentageRequired: 100,
    autoApproveRoles: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRule();
  }, []);

  const fetchRule = async () => {
    try {
      const res = await axios.get('/api/admin/rules');
      if (res.data) setRule(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setRule({
      ...rule,
      steps: [...rule.steps, { role: 'MANAGER', order: rule.steps.length + 1 }]
    });
  };

  const removeStep = (index) => {
    const newSteps = rule.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setRule({ ...rule, steps: newSteps });
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/admin/rules', rule);
      alert('Governance rules updated successfully.');
    } catch (err) {
      alert('Failed to save rules.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px' }}>
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <h1 className="heading-accent" style={{ fontSize: '2.5rem' }}>Enterprise Governance</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Define the multi-stage approval workflow for all expense submissions.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Core Workflow Section */}
        <section className="glass bento-item" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={22} color="var(--accent-primary)" />
              Approval Pipeline
            </h3>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={addStep}>
              <Plus size={16} /> Add Stage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rule.steps.map((step, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', position: 'relative', border: '1px solid var(--border)' }}>
                 <div style={{ width: '40px', height: '40px', background: 'var(--text-main)', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                   {step.order}
                 </div>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>APPROVAL ROLE</div>
                   <select 
                     value={step.role} 
                     onChange={(e) => {
                       const next = [...rule.steps];
                       next[idx].role = e.target.value;
                       setRule({ ...rule, steps: next });
                     }}
                     style={{ maxWidth: '240px' }}
                   >
                     <option>MANAGER</option>
                     <option>FINANCE</option>
                     <option>DIRECTOR</option>
                   </select>
                 </div>
                 <button onClick={() => removeStep(idx)} style={{ background: 'transparent', color: '#ef4444' }}>
                   <Trash2 size={20} />
                 </button>
                 {idx < rule.steps.length - 1 && (
                   <div style={{ position: 'absolute', bottom: '-26px', left: '36px', height: '26px', width: '2px', background: 'var(--border)' }}></div>
                 )}
              </div>
            ))}
            {rule.steps.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <AlertTriangle size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-muted)' }}>No approval stages defined. Expenses will be auto-submitted.</p>
              </div>
            )}
          </div>
        </section>

        {/* Global ConfigurationSection */}
        <section className="glass bento-item" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <Settings size={22} color="var(--accent-primary)" />
            Logic Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
             <div>
               <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.85rem' }}>VALUATION RULE</label>
               <select value={rule.ruleType} onChange={(e) => setRule({ ...rule, ruleType: e.target.value })}>
                 <option value="SEQUENTIAL">Sequential (Step-by-Step)</option>
                 <option value="PERCENTAGE">Consensus (Percentage Match)</option>
                 <option value="HYBRID">Hybrid Intelligent</option>
               </select>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                 Sequential requires each person to approve in order. Consensus allows any stakeholder to weigh in.
               </p>
             </div>

             {rule.ruleType === 'PERCENTAGE' && (
               <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.85rem' }}>PERCENTAGE FOR APPROVAL</label>
                  <input 
                    type="number" 
                    value={rule.percentageRequired} 
                    onChange={(e) => setRule({ ...rule, percentageRequired: Number(e.target.value) })}
                    min="1" max="100"
                  />
               </div>
             )}
          </div>

          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} className="btn-primary" style={{ padding: '14px 40px' }}>
               Deploy Rules <Check size={20} />
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
