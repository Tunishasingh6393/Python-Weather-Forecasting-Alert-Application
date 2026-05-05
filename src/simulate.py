import json
import time

def simulate_weather():
    print("--- Weather Alert Simulation Mode ---")
    print("Loading simulated atmospheric data...")
    
    # Example raw data that would normally come from an API
    simulated_data = [
        {"city": "Industrial Zone", "temp": 42.5, "event": "Heatwave", "risk": "Critical"},
        {"city": "Coastal Route", "temp": 22.0, "event": "Storm Surge", "risk": "High"},
        {"city": "Central Farm", "temp": 28.0, "event": "Normal", "risk": "Low"}
    ]
    
    for record in simulated_data:
        print(f"\n[SCANNING] Monitoring sensors in {record['city']}...")
        time.sleep(1)
        
        if record['risk'] == "Critical" or record['risk'] == "High":
            print(f"🚨 ALERT TRIGGERED: {record['event']} detected!")
            print(f"Action: Protective measures required (Current Temp: {record['temp']}°C)")
        else:
            print(f"✅ Status: Stable. No alerts for {record['city']}.")

if __name__ == "__main__":
    simulate_weather()
