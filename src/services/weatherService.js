export const fetchCurrentWeather = async (params, unit = "metric") => {
  const query = typeof params === "string" ? `q=${encodeURIComponent(params)}` : `lat=${params.lat}&lon=${params.lon}`;
  const response = await fetch(`/api/weather?${query}&units=${unit}`);
  if (!response.ok) throw new Error("City not found or network error");
  return response.json();
};

export const fetchForecast = async (params, unit = "metric") => {
  const query = typeof params === "string" ? `q=${encodeURIComponent(params)}` : `lat=${params.lat}&lon=${params.lon}`;
  const response = await fetch(`/api/forecast?${query}&units=${unit}`);
  if (!response.ok) throw new Error("Forecast not available");
  return response.json();
};

export const fetchAiAdvice = async (weather, temp, unit, city) => {
  try {
    const response = await fetch("/api/ai-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weather, temp, unit, city })
    });
    if (!response.ok) return { advice: "Enjoy your day and stay prepared!" };
    return response.json();
  } catch {
    return { advice: "Stay comfortable and check local updates." };
  }
};

export const getDailyForecast = (list) => {
  if (!list) return [];
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
  if (!list) return [];
  return list.slice(0, 8); // Next 24 hours (3-hourly intervals)
};
