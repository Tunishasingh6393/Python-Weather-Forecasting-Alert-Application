# Raw Data Storage 🗄️

This directory serves as the persistence layer for simulation and testing.

### Files:
- **`simulation_data.json`**: A JSON-formatted snapshot of a "Critical Risk" weather scenario. Used by the `simulate.py` and `main.py` scripts to test alerting logic without hitting external API limits.
- **`historical_weather.csv`**: A sample dataset containing 5 days of weather readings. Used to demonstrate data parsing and visualization capabilities (e.g., Pandas analysis).

### Purpose:
Ensuring the project remains "functional" during presentations or offline reviews by providing high-quality, pre-parsed data payloads.
