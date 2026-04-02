import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Target, Zap, Globe, Rocket, HelpCircle, ChevronDown } from 'lucide-react';

export default function About() {
  const [expandedMember, setExpandedMember] = useState(null);

  const values = [
    {
      title: "Integrity",
      desc: "Our interconnected governance ensures every cent is tracked with absolute precision.",
      icon: <ShieldCheck size={28} className="color-accent" />
    },
    {
      title: "Velocity",
      desc: "Instant OCR extraction and real-time approvals to keep your focus on the business.",
      icon: <Zap size={28} className="color-accent" />
    },
    {
      title: "Global Connectivity",
      desc: "Supporting multi-currency enterprises across all borders with a unified flow.",
      icon: <Globe size={28} className="color-accent" />
    }
  ];

  const team = [
    {
      name: "Ajay Ghadage",
      role: "AI/ML Learner & Scalable Backend Arch.",
      image: "/images/team/ajay.png",
      bio: "Leading the architecture of our API and integrating cutting-edge machine learning models into scalable systems for optimal, real-time performance and Developed REST Apis"
    },
    {
      name: "Avishkar Gunjal",
      role: "Frontend Developer (React)",
      image: "/images/team/avishkar.png",
      bio: "Crafting beautiful, responsive, and highly interactive user interfaces using React, focusing on delivering a seamless user experience across all devices."
    },
    {
      name: "Yashraj Babar",
      role: "ML Learner & Backend Developer",
      image: "/images/team/yashraj.png",
      bio: "Focusing on data processing pipelines and core backend workflows, while continually expanding expertise in machine learning and predictive analytics."
    },
    {
      name: "Rohit Gaikwad",
      role: "Database Engineer",
      image: "/images/team/rohit.png",
      bio: "Pioneering our robust data storage strategy, ensuring high availability, uncompromised security, and highly optimized query performance."
    }
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '100px' }}>
      <div
        className="bg-overlay"
        style={{
          background: 'radial-gradient(circle at 0% 0%, #fffbeb 0%, #fef3c7 20%, #f8fafc 100%)',
          opacity: 1
        }}
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '80px', paddingTop: '40px' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ width: '80px', height: '80px', background: 'var(--accent-primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 32px' }}
          >
            <Target size={40} />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="heading-accent"
            style={{ fontSize: '3.5rem', marginBottom: '24px' }}
          >
            Reimagining <br /> Enterprise Spend
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto' }}
          >
            ExpenseOS is the world's first interconnected reimbursement platform built for
            governance at scale. We combine high-performance OCR machine learning with
            dynamic multi-stage approval logic to empower teams globally.
          </motion.p>
        </div>

        {/* Vision Section */}
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '80px' }}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass card"
            style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'var(--accent-light)', borderRadius: '50%', opacity: 0.5 }}></div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              To eliminate the friction of financial paperwork through intelligent automation,
              allowing workforce creators to spend their energy on what truly matters.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass card"
            style={{ padding: '48px', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '100px', height: '100px', background: 'var(--accent-light)', borderRadius: '50%', opacity: 0.5 }}></div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>Our Vision</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
              A borderless corporate ecosystem where trust and transparency are baked into
              every transaction, powered by secure, interconnected intelligence.
            </p>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.2rem' }}>Core Benchmarks</h2>
          <div className="bento-grid">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass bento-item"
                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--accent-light)', borderRadius: '16px' }}>{v.icon}</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{v.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div style={{ marginBottom: '100px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.2rem' }}>MEET TO TEAM ARYA</h2>
          <div className="bento-grid">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass bento-item"
                style={{ textAlign: 'center', padding: '32px 16px', cursor: 'pointer', position: 'relative' }}
                onClick={() => setExpandedMember(expandedMember === i ? null : i)}
              >
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 20px', overflow: 'hidden', border: '3px solid var(--accent-light)' }}>
                  <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{member.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{member.role}</p>

                <AnimatePresence>
                  {expandedMember === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: '20px' }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '0 0 16px 0' }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', textAlign: 'left', padding: '0 8px' }}>
                        {member.bio}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ marginTop: '16px', opacity: 0.5 }}>
                  <ChevronDown size={20} style={{ transform: expandedMember === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final Hook */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="glass card"
          style={{ padding: '60px', textAlign: 'center', background: 'var(--text-main)', color: 'white', borderRadius: '32px' }}
        >
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'white' }}>Join the Future of Spend</h2>
          <p style={{ opacity: 0.8, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Empower your team with a platform that understands business as much as you do.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Globe size={24} />
            <Rocket size={24} />
            <HelpCircle size={24} />
          </div>
        </motion.div>

      </div>
      <style>{`.color-accent { color: var(--accent-primary); }`}</style>
    </div>
  );
}
