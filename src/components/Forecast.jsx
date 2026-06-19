import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Forecast({ daily, hourly, getWeatherIcon }) {
  const [activeTab, setActiveTab] = useState('daily');
  const MotionDiv = motion.div;

  return (
    <div className="forecast-section">
      <div className="forecast-tabs">
        <button
          className={activeTab === 'daily' ? 'active' : ''}
          onClick={() => setActiveTab('daily')}
        >
          Daily
        </button>
        <button
          className={activeTab === 'hourly' ? 'active' : ''}
          onClick={() => setActiveTab('hourly')}
        >
          Hourly
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'daily' ? (
          <MotionDiv
            key="daily"
            className="forecast-grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {daily.map((day, i) => (
              <div key={i} className="forecast-card">
                <div className="forecast-day">
                  {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="forecast-icon">
                  {getWeatherIcon(day.weather[0].main.toLowerCase())}
                </div>
                <div className="forecast-temp">{Math.round(day.main.temp)}°</div>
              </div>
            ))}
          </MotionDiv>
        ) : (
          <MotionDiv
            key="hourly"
            className="forecast-grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {hourly.map((hour, i) => (
              <div key={i} className="forecast-card">
                <div className="forecast-day">
                  {new Date(hour.dt * 1000).toLocaleTimeString("en-US", { hour: "numeric" })}
                </div>
                <div className="forecast-icon">
                  {getWeatherIcon(hour.weather[0].main.toLowerCase())}
                </div>
                <div className="forecast-temp">{Math.round(hour.main.temp)}°</div>
              </div>
            ))}
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
