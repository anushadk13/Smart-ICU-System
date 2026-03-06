# Smart ICU & Remote Monitoring System

A comprehensive ICU patient monitoring platform featuring real-time data streaming, ML-driven anomaly detection, and a clinical dashboard.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Recharts
- **Backend:** FastAPI, PostgreSQL (TimescaleDB), Redis
- **IoT:** MQTT (Mosquitto), Python Simulator
- **AI/ML:** Scikit-learn (Anomaly Detection)
- **Infrastructure:** Docker, Docker Compose, Nginx

## Getting Started

1. **Clone the repository** (if you haven't already).
2. **Start the services:**
   ```bash
   docker-compose up --build
   ```
3. **Access the dashboard:**
   Open `http://localhost:3000` in your browser.

## Default Credentials
- **Doctor:** `doctor` / `password123`
- **Nurse:** `nurse` / `password123`
- **Admin:** `admin` / `password123`
