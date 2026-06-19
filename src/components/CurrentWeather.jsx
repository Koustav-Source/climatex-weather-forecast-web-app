import { motion } from 'framer-motion';

export default function CurrentWeather({ temp, description, feelsLike, unit, icon }) {
  const MotionDiv = motion.div;
  return (
    <MotionDiv
      className="current-weather"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="weather-icon-large">{icon}</div>
      <div className="temperature-main">
        {Math.round(temp)}°{unit === "metric" ? "C" : "F"}
      </div>
      <div className="condition-text">{description}</div>
      <div className="feels-like-text">
        Feels like {Math.round(feelsLike)}°{unit === "metric" ? "C" : "F"}
      </div>
    </MotionDiv>
  );
}
