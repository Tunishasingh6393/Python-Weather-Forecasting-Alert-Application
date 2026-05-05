import requests
import pandas as pd
import json
from datetime import datetime
import os

# Configuration & Thresholds
TEMP_THRESHOLD_HIGH = 35.0  # Celsius
RAIN_PROB_THRESHOLD = 60    # Percentage
WIND_SPEED_THRESHOLD = 20.0 # km/h

class WeatherSystem:
    def __init__(self, city="New York", lat=40.71, lon=-74.01):
        self.city = city
        self.lat = lat
        self.lon = lon
        self.api_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,precipitation_probability,wind_speed_10m&current_weather=true&timezone=auto"

    def fetch_data(self):
        """Fetches live weather data from Open-Meteo API."""
        try:
            print(f"[LOG] Fetching data for {self.city}...")
            response = requests.get(self.api_url)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[ERROR] Failed to fetch data: {e}")
            return None

    def process_forecast(self, data):
        """Processes the hourly forecast data into a Clean DataFrame."""
        hourly = data.get('hourly', {})
        df = pd.DataFrame({
            'time': pd.to_datetime(hourly.get('time')),
            'temp': hourly.get('temperature_2m'),
            'rain_prob': hourly.get('precipitation_probability'),
            'wind_speed': hourly.get('wind_speed_10m')
        })
        return df

    def check_alerts(self, current_weather, forecast_df):
        """Analyzes weather and triggers risk alerts."""
        alerts = []
        
        # 1. Current Temperature Alert
        curr_temp = current_weather.get('temperature')
        if curr_temp >= TEMP_THRESHOLD_HIGH:
            alerts.append(f"⚠️ HEAT ALERT: Current temp is {curr_temp}°C (Threshold: {TEMP_THRESHOLD_HIGH}°C)")

        # 2. Upcoming Rain Alert (Next 12 hours)
        next_12h = forecast_df.head(12)
        max_rain_prob = next_12h['rain_prob'].max()
        if max_rain_prob >= RAIN_PROB_THRESHOLD:
            alerts.append(f"🌧️ RAIN ALERT: {max_rain_prob}% chance of rain in the next 12 hours!")

        # 3. High Wind Alert
        max_wind = next_12h['wind_speed'].max()
        if max_wind >= WIND_SPEED_THRESHOLD:
            alerts.append(f"🌬️ WIND ALERT: High winds detected ({max_wind} km/h)!")

        return alerts

    def generate_report(self, city, current, alerts, df):
        """Saves a summary report to a text file in the reports/ folder."""
        if not os.path.exists("reports"):
            os.makedirs("reports")
            
        report_name = f"reports/weather_report_{city.lower()}_{datetime.now().strftime('%Y%m%d_%H%M')}.txt"
        
        with open(report_name, 'w') as f:
            f.write(f"WEATHER ANALYSIS REPORT: {city}\n")
            f.write(f"Generated at: {datetime.now()}\n")
            f.write("-" * 30 + "\n")
            f.write(f"Current Temp: {current.get('temperature')}°C\n")
            f.write(f"Wind Speed: {current.get('windspeed')} km/h\n")
            f.write("-" * 30 + "\n")
            f.write("ALERTS TRIGGERED:\n")
            if not alerts:
                f.write("None. Weather is stable.\n")
            else:
                for a in alerts:
                    f.write(f"- {a}\n")
            f.write("-" * 30 + "\n")
            f.write("Next 5-hour Forecast:\n")
            f.write(df.head(5).to_string())
        
        print(f"[SUCCESS] Report saved as {report_name}")

def main():
    print("--- Weather Forecast & Alert System ---")
    city_name = input("Enter City Name: ") or "London"
    # Note: In a real app, you'd geocode the city name to lat/lon.
    # For this simulation, we use default London coordinates.
    system = WeatherSystem(city=city_name, lat=51.50, lon=-0.12)
    
    data = system.fetch_data()
    if data:
        current = data.get('current_weather', {})
        df = system.process_forecast(data)
        alerts = system.check_alerts(current, df)
        
        print("\n--- Current Weather ---")
        print(f"Temperature: {current.get('temperature')}°C")
        print(f"Wind Speed: {current.get('windspeed')} km/h")
        
        print("\n--- Risk Alerts ---")
        if alerts:
            for a in alerts:
                print(a)
        else:
            print("✅ No immediate weather risks detected.")
            
        system.generate_report(city_name, current, alerts, df)

if __name__ == "__main__":
    main()
