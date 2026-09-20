import { MapPin, Sun, Moon, Thermometer } from 'lucide-react';

export default function Header({ city, country, unit, toggleUnit, darkMode, toggleDarkMode }) {
  return (
    <div className="header">
      <div className="location">
        <MapPin size={20} className="header-icon" />
        <span>{city}, {country}</span>
      </div>

      <div className="header-controls">
        <button
          className="icon-btn"
          title="Toggle Unit"
          onClick={toggleUnit}
          aria-label={`Switch to ${unit === 'metric' ? 'Fahrenheit' : 'Celsius'}`}
        >
          {unit === "metric" ? "°C" : "°F"}
        </button>
        <button
          className="icon-btn"
          title="Toggle Theme"
          onClick={toggleDarkMode}
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
}
