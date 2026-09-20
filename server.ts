import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Comprehensive fallback mock weather database for industrial reliability
const MOCK_CITIES: Record<string, any> = {
  "kolkata": {
    name: "Kolkata",
    sys: { country: "IN", sunrise: 1710034200, sunset: 1710077400 },
    main: { temp: 32, feels_like: 36, humidity: 75, pressure: 1012 },
    wind: { speed: 4.1 },
    visibility: 6000,
    weather: [{ main: "Clouds", description: "scattered clouds", icon: "03d" }],
    coord: { lat: 22.5726, lon: 88.3639 }
  },
  "london": {
    name: "London",
    sys: { country: "GB", sunrise: 1710050000, sunset: 1710090000 },
    main: { temp: 12, feels_like: 10, humidity: 82, pressure: 1015 },
    wind: { speed: 6.2 },
    visibility: 10000,
    weather: [{ main: "Rain", description: "light rain", icon: "10d" }],
    coord: { lat: 51.5074, lon: -0.1278 }
  },
  "new york": {
    name: "New York",
    sys: { country: "US", sunrise: 1710070000, sunset: 1710112000 },
    main: { temp: 18, feels_like: 18, humidity: 55, pressure: 1020 },
    wind: { speed: 5.5 },
    visibility: 10000,
    weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
    coord: { lat: 40.7128, lon: -74.0060 }
  },
  "tokyo": {
    name: "Tokyo",
    sys: { country: "JP", sunrise: 1710020000, sunset: 1710062000 },
    main: { temp: 15, feels_like: 14, humidity: 60, pressure: 1018 },
    wind: { speed: 3.6 },
    visibility: 10000,
    weather: [{ main: "Clear", description: "sunny", icon: "01d" }],
    coord: { lat: 35.6762, lon: 139.6503 }
  },
  "paris": {
    name: "Paris",
    sys: { country: "FR", sunrise: 1710048000, sunset: 1710091000 },
    main: { temp: 16, feels_like: 15, humidity: 68, pressure: 1016 },
    wind: { speed: 4.8 },
    visibility: 10000,
    weather: [{ main: "Clouds", description: "broken clouds", icon: "04d" }],
    coord: { lat: 48.8566, lon: 2.3522 }
  },
  "sydney": {
    name: "Sydney",
    sys: { country: "AU", sunrise: 1710015000, sunset: 1710059000 },
    main: { temp: 24, feels_like: 25, humidity: 65, pressure: 1014 },
    wind: { speed: 5.1 },
    visibility: 10000,
    weather: [{ main: "Clear", description: "sunny", icon: "01d" }],
    coord: { lat: -33.8688, lon: 151.2093 }
  }
};

function generateMockForecast(cityName: string, baseTemp = 20) {
  const list = [];
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < 40; i++) {
    const dt = now + i * 3 * 3600;
    const tempVariation = Math.sin(i / 4) * 5;
    list.push({
      dt,
      main: {
        temp: Math.round((baseTemp + tempVariation) * 10) / 10,
        feels_like: Math.round((baseTemp + tempVariation - 1) * 10) / 10,
        humidity: Math.min(95, Math.max(30, 65 + Math.round(Math.sin(i) * 20))),
        pressure: 1013
      },
      weather: [{
        main: i % 3 === 0 ? "Rain" : i % 2 === 0 ? "Clouds" : "Clear",
        description: i % 3 === 0 ? "light rain" : i % 2 === 0 ? "scattered clouds" : "clear sky",
        icon: i % 3 === 0 ? "10d" : i % 2 === 0 ? "03d" : "01d"
      }],
      wind: { speed: 4.5 }
    });
  }
  return { list, city: { name: cityName, country: "US" } };
}

// API Routes with Open-Meteo Integration (Supports any city/town worldwide without needing an API key)
app.get("/api/weather", async (req, res) => {
  try {
    const { q, lat, lon, units = "metric" } = req.query;
    
    let targetLat = lat ? Number(lat) : null;
    let targetLon = lon ? Number(lon) : null;
    let locationName = q ? String(q) : "Kolkata";
    let countryCode = "IN";

    // If text query provided, geocode using Open-Meteo Geocoding API
    if (q && (!lat || !lon)) {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(String(q))}&count=1&language=en&format=json`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.results && geoData.results.length > 0) {
          const loc = geoData.results[0];
          targetLat = loc.latitude;
          targetLon = loc.longitude;
          locationName = loc.name;
          countryCode = loc.country_code ? loc.country_code.toUpperCase() : "INT";
        }
      }
    }

    // If we have coordinates, fetch real weather from Open-Meteo
    if (targetLat !== null && targetLon !== null) {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m&timezone=auto`);
      if (weatherRes.ok) {
        const wData = await weatherRes.json();
        const current = wData.current;
        
        let temp = current.temperature_2m;
        let feelsLike = current.apparent_temperature;
        let windSpeed = current.wind_speed_10m; // km/h

        if (units === "imperial") {
          temp = Math.round((temp * 9/5 + 32) * 10) / 10;
          feelsLike = Math.round((feelsLike * 9/5 + 32) * 10) / 10;
          windSpeed = Math.round((windSpeed * 0.621371) * 10) / 10; // mph
        }

        // Map WMO weather code to condition
        const code = current.weather_code;
        let mainCondition = "Clear";
        let desc = "clear sky";
        let icon = "01d";

        if (code >= 1 && code <= 3) {
          mainCondition = "Clouds";
          desc = "partly cloudy";
          icon = "03d";
        } else if (code >= 51 && code <= 67) {
          mainCondition = "Rain";
          desc = "rain showers";
          icon = "10d";
        } else if (code >= 71 && code <= 77) {
          mainCondition = "Snow";
          desc = "snow fall";
          icon = "13d";
        } else if (code >= 95) {
          mainCondition = "Thunderstorm";
          desc = "thunderstorm";
          icon = "11d";
        }

        return res.json({
          name: locationName,
          sys: { country: countryCode, sunrise: 1710034200, sunset: 1710077400 },
          main: {
            temp: temp,
            feels_like: feelsLike,
            humidity: current.relative_humidity_2m,
            pressure: current.surface_pressure || 1013
          },
          wind: { speed: windSpeed },
          visibility: 10000,
          weather: [{ main: mainCondition, description: desc, icon: icon }],
          coord: { lat: targetLat, lon: targetLon }
        });
      }
    }

    // Fallback to mock dictionary if geocoding fails
    let cityName = q ? String(q).toLowerCase() : "kolkata";
    const cityData = MOCK_CITIES[cityName] || {
      ...MOCK_CITIES["kolkata"],
      name: locationName
    };
    
    let responseData = JSON.parse(JSON.stringify(cityData));
    if (units === "imperial") {
      responseData.main.temp = Math.round((responseData.main.temp * 9/5 + 32) * 10) / 10;
      responseData.main.feels_like = Math.round((responseData.main.feels_like * 9/5 + 32) * 10) / 10;
      responseData.wind.speed = Math.round((responseData.wind.speed * 2.23694) * 10) / 10;
    }
    res.json(responseData);
  } catch (err) {
    console.error("Weather API error:", err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/api/forecast", async (req, res) => {
  try {
    const { q, lat, lon, units = "metric" } = req.query;
    
    let targetLat = lat ? Number(lat) : null;
    let targetLon = lon ? Number(lon) : null;
    let locationName = q ? String(q) : "Kolkata";

    if (q && (!lat || !lon)) {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(String(q))}&count=1&language=en&format=json`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.results && geoData.results.length > 0) {
          const loc = geoData.results[0];
          targetLat = loc.latitude;
          targetLon = loc.longitude;
          locationName = loc.name;
        }
      }
    }

    if (targetLat !== null && targetLon !== null) {
      const forecastRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`);
      if (forecastRes.ok) {
        const fData = await forecastRes.json();
        const hourlyTimes = fData.hourly.time;
        const hourlyTemps = fData.hourly.temperature_2m;
        const hourlyCodes = fData.hourly.weather_code;
        const hourlyWinds = fData.hourly.wind_speed_10m;
        const hourlyHumidities = fData.hourly.relative_humidity_2m;

        const list = [];
        for (let i = 0; i < hourlyTimes.length; i++) {
          const dt = Math.floor(new Date(hourlyTimes[i]).getTime() / 1000);
          let temp = hourlyTemps[i];
          if (units === "imperial") {
            temp = Math.round((temp * 9/5 + 32) * 10) / 10;
          }

          const code = hourlyCodes[i];
          let mainCondition = "Clear";
          let desc = "clear sky";
          let icon = "01d";
          if (code >= 1 && code <= 3) {
            mainCondition = "Clouds";
            desc = "partly cloudy";
            icon = "03d";
          } else if (code >= 51 && code <= 67) {
            mainCondition = "Rain";
            desc = "rain showers";
            icon = "10d";
          } else if (code >= 71) {
            mainCondition = "Snow";
            desc = "snow";
            icon = "13d";
          }

          list.push({
            dt,
            main: {
              temp: temp,
              feels_like: temp,
              humidity: hourlyHumidities[i] || 60,
              pressure: 1013
            },
            weather: [{ main: mainCondition, description: desc, icon: icon }],
            wind: { speed: hourlyWinds[i] || 4 }
          });
        }

        return res.json({ list, city: { name: locationName, country: "US" } });
      }
    }

    const cityName = q ? String(q) : "Kolkata";
    const baseTemp = units === "imperial" ? 72 : 22;
    const forecast = generateMockForecast(cityName, baseTemp);
    res.json(forecast);
  } catch (err) {
    console.error("Forecast API error:", err);
    res.status(500).json({ error: "Failed to fetch forecast data" });
  }
});

app.post("/api/ai-advice", async (req, res) => {
  try {
    const { weather, temp, unit, city } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // If quota is exhausted or key missing, immediately return smart local advice
    if (!apiKey || process.env.QUOTA_EXHAUSTED === "true") {
      return res.json({
        advice: `• Conditions in ${city}: ${weather} at ${temp}°${unit === "metric" ? "C" : "F"}.\n• Outfit & Health: Dress comfortably for the weather, maintain hydration, and check local radar if planning outdoor excursions.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Provide concise, expert weather clothing, health, and activity advice in 3 short bullet points for someone in ${city} where the weather is ${weather} and temperature is ${temp}°${unit === "metric" ? "C" : "F"}. Keep it engaging and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ advice: response.text || "Enjoy your day and stay prepared for the weather!" });
  } catch (err: any) {
    // If it's a 429 quota error, set flag to skip future calls and avoid log spam
    if (err?.message?.includes("429") || err?.status === "RESOURCE_EXHAUSTED") {
      process.env.QUOTA_EXHAUSTED = "true";
    }
    const { weather, temp, unit, city } = req.body || {};
    res.json({ 
      advice: `• Current Conditions: ${weather} at ${temp}°${unit === "metric" ? "C" : "F"} in ${city || "your area"}.\n• Recommendation: Dress comfortably, stay hydrated, and keep an eye on local atmospheric updates.` 
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ClimateX Server running on http://localhost:${PORT}`);
  });
}

startServer();
