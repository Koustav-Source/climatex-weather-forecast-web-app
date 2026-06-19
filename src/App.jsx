import { useEffect, useState, useCallback } from "react";
import "./App.css";
import { fetchCurrentWeather, fetchForecast, getDailyForecast, getHourlyForecast } from "./services/weatherService";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import CurrentWeather from "./components/CurrentWeather";
import WeatherDetails from "./components/WeatherDetails";
import Forecast from "./components/Forecast";
import WeatherBackground from "./components/WeatherBackground";
import SkeletonLoader from "./components/ui/SkeletonLoader";
import ErrorMessage from "./components/ui/ErrorMessage";

export default function App() {
  const [city, setCity] = useState(localStorage.getItem("lastCity") || "Kolkata");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [unit, setUnit] = useState(localStorage.getItem("unit") || "metric");

  const fetchData = useCallback(async (params) => {
    try {
      setLoading(true);
      setError("");
      const [weather, forecast] = await Promise.all([
        fetchCurrentWeather(params, unit),
        fetchForecast(params, unit)
      ]);
      setWeatherData(weather);
      setForecastData(forecast);
      setCity(weather.name);
      localStorage.setItem("lastCity", weather.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [unit]);

  useEffect(() => {
    fetchData(city);
    // We only want to refetch when unit changes.
    // Manual searches and geolocation handle their own fetchData calls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, unit]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    localStorage.setItem("unit", unit);
  }, [darkMode, unit]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchData({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setError("Location access denied")
      );
    } else {
      setError("Geolocation not supported");
    }
  };

  const getWeatherCondition = () => {
    if (!weatherData) return "clear";
    const main = weatherData.weather[0].main.toLowerCase();
    if (main.includes("rain") || main.includes("drizzle")) return "rainy";
    if (main.includes("cloud")) return "cloudy";
    if (main.includes("snow")) return "snowy";
    if (main.includes("thunder")) return "stormy";
    if (main.includes("mist") || main.includes("fog")) return "foggy";
    const now = Date.now() / 1000;
    if (weatherData.sys.sunset < now || weatherData.sys.sunrise > now) return "night";
    return "clear";
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      clear: "☀️", cloudy: "☁️", rainy: "🌧️", snowy: "❄️", stormy: "⛈️", foggy: "🌫️", night: "🌙"
    };
    return icons[condition] || "☀️";
  };

  const formatTime = (ts) => new Date(ts * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const weatherCondition = getWeatherCondition();

  return (
    <div className={`app-container ${weatherCondition} ${darkMode ? "dark" : ""}`}>
      <WeatherBackground condition={weatherCondition} darkMode={darkMode} />

      <main className="main-content">
        <div className="weather-card">
          <Header
            city={city}
            country={weatherData?.sys?.country}
            unit={unit}
            toggleUnit={() => setUnit(unit === "metric" ? "imperial" : "metric")}
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
          />

          <SearchBar onSearch={(q) => fetchData(q)} onGetLocation={handleGetLocation} />

          {loading ? (
            <SkeletonLoader />
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => fetchData("Kolkata")} />
          ) : (
            <>
              <CurrentWeather
                temp={weatherData.main.temp}
                description={weatherData.weather[0].description}
                feelsLike={weatherData.main.feels_like}
                unit={unit}
                icon={getWeatherIcon(weatherCondition)}
              />

              <WeatherDetails
                humidity={weatherData.main.humidity}
                windSpeed={weatherData.wind.speed}
                pressure={weatherData.main.pressure}
                visibility={weatherData.visibility}
                sunrise={formatTime(weatherData.sys.sunrise)}
                sunset={formatTime(weatherData.sys.sunset)}
                unit={unit}
              />

              <Forecast
                daily={getDailyForecast(forecastData.list)}
                hourly={getHourlyForecast(forecastData.list)}
                unit={unit}
                getWeatherIcon={getWeatherIcon}
              />
            </>
          )}
        </div>
        <footer className="app-footer">
          <p>ClimateX © {new Date().getFullYear()} • Professional Weather Insights</p>
        </footer>
      </main>
    </div>
  );
}
