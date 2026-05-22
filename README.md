# Smart Agriculture Monitoring and Automated Irrigation System

This is a complete connected software prototype.

## Features
- Backend API using Node.js and Express.js
- Simulated IoT sensor data
- Soil moisture, temperature, humidity, and light monitoring
- Automated irrigation logic
- Manual irrigation control
- Alerts and notifications
- Historical sensor chart
- Responsive web dashboard

## Run Locally

1. Install Node.js.
2. Open terminal in this folder.
3. Run:

```bash
npm install
npm start
```

4. Open browser:

```text
http://localhost:3000
```

5. Test API:

```text
http://localhost:3000/api/status
http://localhost:3000/api/sensors
```

## Deployment

Use Render, Railway, or Cyclic for full backend + frontend hosting.

For Render:
1. Upload this folder to GitHub.
2. Go to render.com.
3. Create New Web Service.
4. Connect your GitHub repository.
5. Build command: `npm install`
6. Start command: `npm start`
7. Deploy.
8. Render gives a public live link.
