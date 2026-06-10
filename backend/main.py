from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import datetime

app = FastAPI(title="Smart Waste Management API")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorData(BaseModel):
    bin_id: str
    distance_cm: float

# In-memory storage acting as our cloud database
bins_db = {
    "bin_001": {
        "bin_id": "bin_001",
        "bin_height_cm": 30.0, # Assuming a 30cm deep bin
        "distance_cm": 30.0,
        "fill_percentage": 0.0,
        "status": "Empty",
        "last_updated": None
    }
}

@app.post("/api/sensor")
def update_sensor_data(data: SensorData):
    """Endpoint for IoT hardware or virtual simulator to send HC-SR04 data"""
    if data.bin_id not in bins_db:
        raise HTTPException(status_code=404, detail="Bin not found")

    bin_info = bins_db[data.bin_id]
    bin_info["distance_cm"] = data.distance_cm

    # Fill Percentage Calculation
    fill_pct = ((bin_info["bin_height_cm"] - data.distance_cm) / bin_info["bin_height_cm"]) * 100
    fill_pct = max(0.0, min(100.0, fill_pct)) # Clamp between 0 and 100
    bin_info["fill_percentage"] = round(fill_pct, 2)

    # Threshold Comparison & Alert Logic
    if fill_pct > 80:
        bin_info["status"] = "Full (Alert!)"
    elif fill_pct > 40:
        bin_info["status"] = "Half Full"
    else:
        bin_info["status"] = "Empty"

    bin_info["last_updated"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return {"message": "Data updated successfully", "data": bin_info}

@app.get("/api/bins")
def get_all_bins():
    """Endpoint for the React dashboard to fetch current bin status"""
    return list(bins_db.values())