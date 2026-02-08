import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  // ===== Core States =====
  const [city, setCity] = useState("Kolkata");
  const [searchInput, setSearchInput] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [unit, setUnit] = useState(localStorage.getItem("unit") || "metric"); // metric or imperial
  const [showForecast, setShowForecast] = useState(false);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // ===== Persist Preferences =====
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    localStorage.setItem("unit", unit);
  }, [darkMode, unit]);

  // ===== Fetch Weather Data =====
  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError("");

      // Current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${unit}&appid=${API_KEY}`
      );

      if (!weatherResponse.ok) {
        throw new Error("City not found");
      }

      const weather = await weatherResponse.json();

      // 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=${unit}&appid=${API_KEY}`
      );

      const forecast = await forecastResponse.json();

      setWeatherData(weather);
      setForecastData(forecast);
      setCity(weather.name);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ===== Geolocation =====
  const fetchWeatherByLocation = async (lat, lon) => {
    try {
      setLoading(true);
      setError("");

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
      );

      const weather = await weatherResponse.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
      );

      const forecast = await forecastResponse.json();

      setWeatherData(weather);
      setForecastData(forecast);
      setCity(weather.name);
      setLoading(false);
    } catch (err) {
      setError("Unable to fetch weather data");
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (err) => {
          setError("Unable to get your location");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  // ===== Initial Load =====
  useEffect(() => {
    fetchWeather(city);
  }, [unit]);

  // ===== Search Handler =====
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput);
      setSearchInput("");
    }
  };

  // ===== Determine Weather Condition =====
  const getWeatherCondition = () => {
    if (!weatherData) return "clear";
    const main = weatherData.weather[0].main.toLowerCase();
    const id = weatherData.weather[0].id;

    if (main.includes("rain") || main.includes("drizzle")) return "rainy";
    if (main.includes("cloud")) return "cloudy";
    if (main.includes("snow")) return "snowy";
    if (main.includes("thunder")) return "stormy";
    if (main.includes("mist") || main.includes("fog")) return "foggy";

    // Check if it's night time
    const now = Date.now() / 1000;
    if (weatherData.sys.sunset < now || weatherData.sys.sunrise > now) {
      return "night";
    }

    return "clear";
  };

  const weatherCondition = getWeatherCondition();

  // ===== Weather Icons (using emoji for now, can replace with icon library) =====
  const getWeatherIcon = (condition) => {
    const icons = {
      clear: "☀️",
      cloudy: "☁️",
      rainy: "🌧️",
      snowy: "❄️",
      stormy: "⛈️",
      foggy: "🌫️",
      night: "🌙",
    };
    return icons[condition] || "☀️";
  };

  // ===== Format Time =====
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===== Get Daily Forecast (group by day) =====
  const getDailyForecast = () => {
    if (!forecastData) return [];

    const daily = [];
    const days = {};

    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!days[date]) {
        days[date] = item;
        daily.push(item);
      }
    });

    return daily.slice(0, 5); // Next 5 days
  };

  // ===== Loading State =====
  if (loading) {
    return (
      <div className={`app loading ${darkMode ? "dark" : ""}`}>
        <div className="weather-card">
          <div className="loader">
            <div className="spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== Error State =====
  if (error && !weatherData) {
    return (
      <div className={`app error ${darkMode ? "dark" : ""}`}>
        <div className="weather-card">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <h2>Oops!</h2>
            <p>{error}</p>
            <button onClick={() => fetchWeather("Kolkata")}>
              Try Kolkata
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Main Render =====
  return (
    <div className={`app ${weatherCondition} ${darkMode ? "dark" : ""}`}>
      {/* ===== Background Scenery ===== */}
      {weatherCondition === "clear" && (
        <>
          <div className="cloud cloud-1">☁️</div>
          <div className="cloud cloud-2">☁️</div>
        </>
      )}

      {weatherCondition === "rainy" && (
        <div className="rain">
          {Array.from({ length: 50 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {weatherCondition === "snowy" && (
        <div className="snow">
          {Array.from({ length: 50 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {(weatherCondition === "night" || darkMode) && <div className="stars"></div>}

      {/* ===== Main Card ===== */}
      <div className="weather-card">
        {/* Header */}
        <div className="header">
          <div className="location">
            📍 {city}, {weatherData?.sys?.country}
          </div>

          <div className="header-controls">
            <button
              className="icon-btn"
              title="Toggle Unit"
              onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
            >
              {unit === "metric" ? "°C" : "°F"}
            </button>
            <button
              className="icon-btn"
              title="Toggle Dark Mode"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
          <button
            type="button"
            className="location-btn"
            onClick={handleGetLocation}
            title="Use my location"
          >
            📍
          </button>
        </form>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* Weather Icon */}
        <div className="weather-icon">
          {getWeatherIcon(weatherCondition)}
        </div>

        {/* Temperature */}
        <div className="temperature">
          {Math.round(weatherData?.main?.temp)}°{unit === "metric" ? "C" : "F"}
        </div>

        {/* Condition */}
        <div className="condition">
          {weatherData?.weather[0]?.description}
        </div>

        {/* Feels Like */}
        <div className="feels-like">
          Feels like {Math.round(weatherData?.main?.feels_like)}°
          {unit === "metric" ? "C" : "F"}
        </div>

        {/* Extra Info */}
        <div className="meta">
          <div className="meta-item">
            <span className="meta-icon">💧</span>
            <div>
              <div className="meta-value">{weatherData?.main?.humidity}%</div>
              <div className="meta-label">Humidity</div>
            </div>
          </div>

          <div className="meta-item">
            <span className="meta-icon">🌬️</span>
            <div>
              <div className="meta-value">
                {Math.round(weatherData?.wind?.speed)}{" "}
                {unit === "metric" ? "m/s" : "mph"}
              </div>
              <div className="meta-label">Wind</div>
            </div>
          </div>

          <div className="meta-item">
            <span className="meta-icon">🧭</span>
            <div>
              <div className="meta-value">
                {weatherData?.main?.pressure} hPa
              </div>
              <div className="meta-label">Pressure</div>
            </div>
          </div>

          <div className="meta-item">
            <span className="meta-icon">👁️</span>
            <div>
              <div className="meta-value">
                {(weatherData?.visibility / 1000).toFixed(1)} km
              </div>
              <div className="meta-label">Visibility</div>
            </div>
          </div>
        </div>

        {/* Sun Times */}
        <div className="sun-times">
          <div className="sun-time">
            <span>🌅</span>
            <div>
              <div className="time-label">Sunrise</div>
              <div className="time-value">
                {formatTime(weatherData?.sys?.sunrise)}
              </div>
            </div>
          </div>
          <div className="sun-time">
            <span>🌇</span>
            <div>
              <div className="time-label">Sunset</div>
              <div className="time-value">
                {formatTime(weatherData?.sys?.sunset)}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Forecast Button */}
        <button
          className="forecast-toggle"
          onClick={() => setShowForecast(!showForecast)}
        >
          {showForecast ? "Hide" : "Show"} 5-Day Forecast
        </button>

        {/* 5-Day Forecast */}
        {showForecast && (
          <div className="forecast">
            <h3>5-Day Forecast</h3>
            <div className="forecast-grid">
              {getDailyForecast().map((day, index) => (
                <div key={index} className="forecast-card">
                  <div className="forecast-day">
                    {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="forecast-icon">
                    {getWeatherIcon(day.weather[0].main.toLowerCase())}
                  </div>
                  <div className="forecast-temp">
                    {Math.round(day.main.temp)}°
                  </div>
                  <div className="forecast-desc">
                    {day.weather[0].description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}