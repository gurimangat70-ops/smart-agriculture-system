const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let state = {
  soilMoisture: 55,
  temperature: 28,
  humidity: 60,
  light: 700,
  irrigation: false,
  cropHealth: "Good",
  alerts: [],
  history: []
};

const LOWER_MOISTURE_LIMIT = 35;
const UPPER_MOISTURE_LIMIT = 60;

function randomChange(value, min, max, change) {
  const newValue = value + (Math.random() * change * 2 - change);
  return Math.max(min, Math.min(max, Math.round(newValue)));
}

function addAlert(message) {
  const alert = {
    time: new Date().toLocaleTimeString(),
    message
  };

  state.alerts.unshift(alert);

  if (state.alerts.length > 10) {
    state.alerts.pop();
  }
}

function updateCropHealth() {
  if (state.soilMoisture < 30 || state.temperature > 38) {
    state.cropHealth = "At Risk";
  } else if (state.soilMoisture < 40 || state.temperature > 34) {
    state.cropHealth = "Moderate";
  } else {
    state.cropHealth = "Good";
  }
}

function generateSensorData() {
  state.temperature = randomChange(state.temperature, 20, 42, 2);
  state.humidity = randomChange(state.humidity, 35, 90, 3);
  state.light = randomChange(state.light, 250, 1000, 50);

  if (state.irrigation) {
    state.soilMoisture += Math.floor(Math.random() * 6) + 3;
  } else {
    state.soilMoisture -= Math.floor(Math.random() * 5) + 1;
  }

  state.soilMoisture = Math.max(15, Math.min(80, state.soilMoisture));

  if (state.soilMoisture < LOWER_MOISTURE_LIMIT && !state.irrigation) {
    state.irrigation = true;
    addAlert("Low soil moisture detected. Automated irrigation started.");
  }

  if (state.soilMoisture >= UPPER_MOISTURE_LIMIT && state.irrigation) {
    state.irrigation = false;
    addAlert("Soil moisture recovered. Automated irrigation stopped.");
  }

  updateCropHealth();

  const reading = {
    time: new Date().toLocaleTimeString(),
    soilMoisture: state.soilMoisture,
    temperature: state.temperature,
    humidity: state.humidity,
    light: state.light,
    irrigation: state.irrigation,
    cropHealth: state.cropHealth
  };

  state.history.push(reading);

  if (state.history.length > 20) {
    state.history.shift();
  }
}

generateSensorData();
setInterval(generateSensorData, 3000);

app.get("/api/status", (req, res) => {
  res.json({
    message: "Smart Agriculture API is running",
    endpoints: [
      "GET /api/sensors",
      "GET /api/history",
      "GET /api/alerts",
      "POST /api/irrigation/toggle",
      "POST /api/reset"
    ]
  });
});

app.get("/api/sensors", (req, res) => {
  res.json(state);
});

app.get("/api/history", (req, res) => {
  res.json(state.history);
});

app.get("/api/alerts", (req, res) => {
  res.json(state.alerts);
});

app.post("/api/irrigation/toggle", (req, res) => {
  state.irrigation = !state.irrigation;
  addAlert(`Manual irrigation toggled ${state.irrigation ? "ON" : "OFF"}.`);
  updateCropHealth();

  res.json({
    message: "Irrigation status updated",
    irrigation: state.irrigation
  });
});

app.post("/api/reset", (req, res) => {
  state = {
    soilMoisture: 55,
    temperature: 28,
    humidity: 60,
    light: 700,
    irrigation: false,
    cropHealth: "Good",
    alerts: [],
    history: []
  };

  generateSensorData();
  res.json({ message: "Simulation reset successfully", state });
});

app.listen(PORT, () => {
  console.log(`Smart Agriculture System running at http://localhost:${PORT}`);
});
