import { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post("/api/chat", {
        message: message,
        history: chatHistory.map(h => ({ role: h.role, content: h.content })),
      });

      const assistantMessage = { role: "assistant", content: res.data.message };
      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! I'm a bit busy right now. Could you please try again in a moment?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            className="glass"
            style={{
              width: "380px",
              height: "580px",
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              marginBottom: "20px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.4)"
            }}
          >
            {/* Premium Header */}
            <div
              style={{
                padding: "24px",
                background: "linear-gradient(135deg, var(--text-main) 0%, #1e293b 100%)",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={24} color="white" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "white", display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Smart Advisor <Sparkles size={14} color="var(--accent-primary)" />
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.7 }}>Powered by ExpenseOS System</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", padding: "8px", borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                background: "rgba(248, 250, 252, 0.4)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "white",
                  padding: "14px 18px",
                  borderRadius: "16px 16px 16px 4px",
                  fontSize: "0.95rem",
                  boxShadow: "var(--shadow-sm)",
                  maxWidth: "85%",
                  border: '1px solid var(--border)',
                  lineHeight: '1.5'
                }}
              >
                Welcome back, <strong>{user?.name?.split(' ')[0]}</strong>! I can help you analyze your spending, check approval statuses, or explain company policy. What's on your mind?
              </motion.div>

              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    backgroundColor: msg.role === "user" ? "var(--text-main)" : "white",
                    color: msg.role === "user" ? "white" : "var(--text-main)",
                    padding: "14px 18px",
                    borderRadius:
                      msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    fontSize: "0.95rem",
                    boxShadow: "var(--shadow-sm)",
                    maxWidth: "85%",
                    border: msg.role === "user" ? 'none' : '1px solid var(--border)',
                    lineHeight: '1.5'
                  }}
                >
                  {msg.content}
                </motion.div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: "flex-start", display: 'flex', gap: '4px', padding: '10px' }}>
                  <div className="dot" style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'bounce 1s infinite 0s' }}></div>
                  <div className="dot" style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                  <div className="dot" style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
                </div>
              )}
            </div>

            {/* Premium Footer */}
            <form
              onSubmit={handleSend}
              style={{
                padding: "20px 24px 32px",
                background: "white",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: "12px",
                alignItems: 'center'
              }}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  borderRadius: "100px",
                  fontSize: "1rem",
                  border: "1px solid var(--border)",
                  background: "#f1f5f9"
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  padding: 0,
                  backgroundColor: "var(--accent-primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  opacity: (isLoading || !message.trim()) ? 0.5 : 1,
                }}
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "24px",
          backgroundColor: "var(--text-main)",
          color: "white",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 100%)' }}></div>
        {isOpen ? <X size={32} /> : <MessageCircle size={32} color="var(--accent-primary)" />}
      </motion.button>
      
      <style>{`
        @keyframes bounce { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-5px); } 
        }
      `}</style>
    </div>
  );
}
