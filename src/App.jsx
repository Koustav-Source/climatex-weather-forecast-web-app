import { useEffect, useState, useCallback } from "react";
import "./App.css";
import { fetchCurrentWeather, fetchForecast, getDailyForecast, getHourlyForecast } from "./services/weatherService";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import CityBookmarks from "./components/CityBookmarks";
import RecentSearches from "./components/RecentSearches";
import CurrentWeather from "./components/CurrentWeather";
import WeatherDetails from "./components/WeatherDetails";
import TemperatureChart from "./components/TemperatureChart";
import AIAdvice from "./components/AIAdvice";
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
  const [, setRecentVersion] = useState(0);

  const saveRecentSearch = (cityName) => {
    if (!cityName) return;
    let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    recent = [cityName, ...recent.filter(c => c.toLowerCase() !== cityName.toLowerCase())].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(recent));
    setRecentVersion(v => v + 1);
  };

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
      saveRecentSearch(weather.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [unit]);

  useEffect(() => {
    fetchData(city);
  }, [unit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    localStorage.setItem("unit", unit);
  }, [darkMode, unit]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchData({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setError("Location access denied or unavailable")
      );
    } else {
      setError("Geolocation not supported by your browser");
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
        <Header
          city={city}
          country={weatherData?.sys?.country || "INT"}
          unit={unit}
          toggleUnit={() => setUnit(unit === "metric" ? "imperial" : "metric")}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
        />

        <div className="dashboard-grid">
          {/* Left Column: Search, Current Weather & Bookmarks */}
          <div className="weather-card">
            <SearchBar onSearch={(q) => fetchData(q)} onGetLocation={handleGetLocation} />
            <CityBookmarks currentCity={city} onSelectCity={(c) => fetchData(c)} />
            <RecentSearches currentCity={city} onSelectCity={(c) => fetchData(c)} />

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

                <AIAdvice 
                  weather={weatherData.weather[0].description} 
                  temp={Math.round(weatherData.main.temp)} 
                  unit={unit} 
                  city={city} 
                />
              </>
            )}
          </div>

          {/* Right Column: Detailed Metrics, Charts & Forecast */}
          <div className="weather-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {loading ? (
              <SkeletonLoader />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => fetchData("Kolkata")} />
            ) : (
              <>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px", fontFamily: "var(--font-display)" }}>
                    Atmospheric Intelligence & Analytics
                  </h3>
                  <WeatherDetails
                    humidity={weatherData.main.humidity}
                    windSpeed={weatherData.wind.speed}
                    pressure={weatherData.main.pressure}
                    visibility={weatherData.visibility}
                    sunrise={formatTime(weatherData.sys.sunrise)}
                    sunset={formatTime(weatherData.sys.sunset)}
                    unit={unit}
                  />

                  {forecastData && (
                    <TemperatureChart 
                      hourly={getHourlyForecast(forecastData.list)} 
                      unit={unit} 
                    />
                  )}
                </div>

                {forecastData && (
                  <div style={{ marginTop: "20px" }}>
                    <Forecast
                      daily={getDailyForecast(forecastData.list)}
                      hourly={getHourlyForecast(forecastData.list)}
                      unit={unit}
                      getWeatherIcon={getWeatherIcon}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <footer className="app-footer">
          <p>ClimateX Enterprise Weather Intelligence • Powered by React & Gemini AI</p>
        </footer>
      </main>
    </div>
  );
}
