import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Fetch Weather Data
  app.get("/api/weather", async (req, res) => {
    const { lat, lon, city } = req.query;
    
    // Default coordinates if none provided (New York)
    const latitude = lat || 40.71;
    const longitude = lon || -74.01;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&current_weather=true&timezone=auto`;
      const response = await axios.get(url);
      const data = response.data;

      // Rule Engine Integration
      const alerts = [];
      const current = data.current_weather;
      
      if (current.temperature >= 35) {
        alerts.push({ type: "Heat", severity: "Critical", message: "Extreme heat warning! Stay hydrated." });
      } else if (current.temperature >= 30) {
        alerts.push({ type: "Heat", severity: "Warning", message: "High temperature detected." });
      }

      if (current.windspeed >= 20) {
        alerts.push({ type: "Wind", severity: "Critical", message: "Dangerous wind speeds! Avoid outdoor activity." });
      }

      // Check forecast (next 12 hours)
      const rainProbs = data.hourly.precipitation_probability.slice(0, 12);
      const maxRainProb = Math.max(...rainProbs);
      if (maxRainProb >= 60) {
        alerts.push({ type: "Rain", severity: "Warning", message: `High chance of rain (${maxRainProb}%) in the coming hours.` });
      }

      res.json({
        city: city || "Selected Location",
        current: current,
        hourly: data.hourly,
        alerts: alerts,
        lastUpdated: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch weather data", details: error.message });
    }
  });

  // Vite middleware for development
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
    console.log(`Weather Server running on http://localhost:${PORT}`);
  });
}

startServer();
