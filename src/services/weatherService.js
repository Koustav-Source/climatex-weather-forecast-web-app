const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const fetchCurrentWeather = async (params, unit = "metric") => {
  const query = typeof params === "string" ? `q=${params}` : `lat=${params.lat}&lon=${params.lon}`;
  const response = await fetch(`${BASE_URL}/weather?${query}&units=${unit}&appid=${API_KEY}`);
  if (!response.ok) throw new Error("City not found");
  return response.json();
};

export const fetchForecast = async (params, unit = "metric") => {
  const query = typeof params === "string" ? `q=${params}` : `lat=${params.lat}&lon=${params.lon}`;
  const response = await fetch(`${BASE_URL}/forecast?${query}&units=${unit}&appid=${API_KEY}`);
  if (!response.ok) throw new Error("Forecast not available");
  return response.json();
};

export const getDailyForecast = (list) => {
  const daily = [];
  const days = {};

  list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!days[date]) {
      days[date] = item;
      daily.push(item);
    }
  });

  return daily.slice(0, 5);
};

export const getHourlyForecast = (list) => {
  return list.slice(0, 8); // Next 24 hours (3-hourly intervals)
};
