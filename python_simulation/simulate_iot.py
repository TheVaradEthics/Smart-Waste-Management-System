import requests
import time
import random

URL = "http://localhost:8000/api/sensor"

def simulate_bin():
    distance = 30.0  # Starts empty (30cm distance from top)
    print("Starting IoT simulation... Press Ctrl+C to stop.")
    
    try:
        while True:
            # Simulate waste being thrown in (distance decreases)
            distance -= random.uniform(0.5, 3.0)
            
            # If bin is full, simulate a garbage truck emptying it
            if distance < 2.0:
                print("🗑️ Garbage collected! Bin is empty again.")
                distance = 30.0 

            payload = {
                "bin_id": "bin_001",
                "distance_cm": round(distance, 2)
            }

            response = requests.post(URL, json=payload)
            print(f"Sent: {payload} | Cloud Response: HTTP {response.status_code}")
            time.sleep(3) # Send data every 3 seconds
            
    except KeyboardInterrupt:
        print("\nSimulation stopped.")

if __name__ == "__main__":
    simulate_bin()