import { Droplets, Wind, Compass, Eye, Sunrise, Sunset } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeatherDetails({ humidity, windSpeed, pressure, visibility, sunrise, sunset, unit }) {
  const MotionDiv = motion.div;
  const details = [
    { label: "Humidity", value: `${humidity}%`, icon: <Droplets size={20} /> },
    { label: "Wind", value: `${Math.round(windSpeed)} ${unit === 'metric' ? 'm/s' : 'mph'}`, icon: <Wind size={20} /> },
    { label: "Pressure", value: `${pressure} hPa`, icon: <Compass size={20} /> },
    { label: "Visibility", value: `${(visibility / 1000).toFixed(1)} km`, icon: <Eye size={20} /> },
    { label: "Sunrise", value: sunrise, icon: <Sunrise size={20} /> },
    { label: "Sunset", value: sunset, icon: <Sunset size={20} /> },
  ];

  return (
    <MotionDiv
      className="weather-details-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {details.map((item, index) => (
        <div key={index} className="detail-item">
          <div className="detail-icon">{item.icon}</div>
          <div className="detail-info">
            <span className="detail-label">{item.label}</span>
            <span className="detail-value">{item.value}</span>
          </div>
        </div>
      ))}
    </MotionDiv>
  );
}
