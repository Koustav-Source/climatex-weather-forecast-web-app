import { useState, useEffect } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import { fetchAiAdvice } from '../services/weatherService';
import { motion } from 'framer-motion';

export default function AIAdvice({ weather, temp, unit, city }) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const getAdvice = async () => {
      setLoading(true);
      const res = await fetchAiAdvice(weather, temp, unit, city);
      if (isMounted) {
        setAdvice(res.advice);
        setLoading(false);
      }
    };
    if (weather && temp !== undefined) {
      getAdvice();
    }
    return () => { isMounted = false; };
  }, [weather, temp, unit, city]);

  const MotionDiv = motion.div;

  return (
    <MotionDiv 
      className="ai-advice-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: "rgba(99, 102, 241, 0.1)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        borderRadius: "16px",
        padding: "16px",
        marginTop: "20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px"
      }}
    >
      <div style={{ color: "#6366f1", marginTop: "2px" }}>
        <Bot size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", fontWeight: 700, fontSize: "0.95rem" }}>
          <span>ClimateX AI Advisor</span>
          <Sparkles size={16} style={{ color: "#6366f1" }} />
        </div>
        {loading ? (
          <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>Analyzing atmospheric conditions with Gemini AI...</p>
        ) : (
          <p style={{ fontSize: "0.9rem", lineHeight: 1.5, opacity: 0.9, whiteSpace: "pre-line" }}>{advice}</p>
        )}
      </div>
    </MotionDiv>
  );
}
