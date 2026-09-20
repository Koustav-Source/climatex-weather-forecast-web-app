import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function TemperatureChart({ hourly, unit }) {
  if (!hourly || hourly.length === 0) return null;

  const data = hourly.map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    temp: Math.round(item.main.temp),
    humidity: item.main.humidity
  }));

  const MotionDiv = motion.div;

  return (
    <MotionDiv 
      className="chart-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      style={{
        marginTop: "24px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "20px",
        padding: "20px",
        border: "1px solid rgba(255, 255, 255, 0.08)"
      }}
    >
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px", fontFamily: "var(--font-display)" }}>
        24-Hour Temperature Trend
      </h3>
      <div style={{ width: "100%", height: "160px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} unit={`°${unit === "metric" ? "C" : "F"}`} />
            <Tooltip 
              contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", color: "#fff" }}
              formatter={(value) => [`${value}°${unit === "metric" ? "C" : "F"}`, "Temperature"]}
            />
            <Area type="monotone" dataKey="temp" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </MotionDiv>
  );
}
