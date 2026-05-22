const API_BASE = "";

const environmentChart = new Chart(document.getElementById("environmentChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Temperature °C", data: [], borderWidth: 2 },
      { label: "Humidity %", data: [], borderWidth: 2 },
      { label: "Light /10", data: [], borderWidth: 2 }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Environmental Sensor Data"
      }
    }
  }
});

const moistureChart = new Chart(document.getElementById("moistureChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Soil Moisture %", data: [], borderWidth: 2 }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Soil Moisture History"
      }
    }
  }
});

async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/status`);
    if (!response.ok) {
      throw new Error("API not responding");
    }

    const data = await response.json();
    document.getElementById("apiStatus").textContent = data.message;
  } catch (error) {
    document.getElementById("apiStatus").textContent = "Backend API is not connected.";
  }
}

async function loadDashboardData() {
  try {
    const response = await fetch(`${API_BASE}/api/sensors`);
    if (!response.ok) {
      throw new Error("Could not load sensor data");
    }

    const data = await response.json();

    document.getElementById("soilMoisture").innerText = data.soilMoisture + "%";
    document.getElementById("temperature").innerText = data.temperature + "°C";
    document.getElementById("humidity").innerText = data.humidity + "%";
    document.getElementById("light").innerText = data.light + " lux";
    document.getElementById("cropHealth").innerText = data.cropHealth;

    const irrigationBox = document.getElementById("irrigationStatus");
    irrigationBox.innerText = data.irrigation ? "ON" : "OFF";
    irrigationBox.className = data.irrigation ? "status on" : "status off";

    updateCharts(data.history);
    updateAlerts(data.alerts);
  } catch (error) {
    document.getElementById("alertsBox").innerHTML =
      `<div class="error">Cannot connect to backend API. Make sure the Node.js server is running.</div>`;
  }
}

function updateCharts(history) {
  const labels = history.map(item => item.time);

  environmentChart.data.labels = labels;
  environmentChart.data.datasets[0].data = history.map(item => item.temperature);
  environmentChart.data.datasets[1].data = history.map(item => item.humidity);
  environmentChart.data.datasets[2].data = history.map(item => Math.round(item.light / 10));
  environmentChart.update();

  moistureChart.data.labels = labels;
  moistureChart.data.datasets[0].data = history.map(item => item.soilMoisture);
  moistureChart.update();
}

function updateAlerts(alerts) {
  const alertsBox = document.getElementById("alertsBox");

  if (!alerts || alerts.length === 0) {
    alertsBox.innerText = "No alerts yet.";
    return;
  }

  alertsBox.innerHTML = alerts
    .map(alert => `<div class="alert-item">${alert.time} - ${alert.message}</div>`)
    .join("");
}

async function toggleIrrigation() {
  try {
    await fetch(`${API_BASE}/api/irrigation/toggle`, {
      method: "POST"
    });

    await loadDashboardData();
  } catch (error) {
    alert("Backend not connected. Start the Node.js server first.");
  }
}

async function resetSimulation() {
  try {
    await fetch(`${API_BASE}/api/reset`, {
      method: "POST"
    });

    await loadDashboardData();
  } catch (error) {
    alert("Backend not connected. Start the Node.js server first.");
  }
}

checkApiStatus();
loadDashboardData();
setInterval(loadDashboardData, 3000);
