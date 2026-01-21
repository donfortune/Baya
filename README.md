# Baya: Real-Time Polling Platform with Full-Stack Observability

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-%234ea94b.svg?style=for-the-badge&logo=opentelemetry&logoColor=white)

Baya is a production-ready, containerized polling application engineered to demonstrate **Microservices Orchestration**, **Real-Time Communication**, and **Deep Observability**.

Unlike standard full-stack apps, Baya features a custom-built telemetry pipeline (The "Glass Box") that visualizes request latency, traces database operations, and centralizes logs without relying on paid 3rd-party vendors.

---

## 🏗 System Architecture

The application is fully containerized using **Docker Compose** to orchestrate 7 distinct services.

### The Stack
* **Frontend:** React (Vite) served via **Nginx** (Custom configuration for SPA routing & Reverse Proxy).
* **Backend:** Node.js (Express) with **Socket.io** for real-time bidirectional events.
* **Database:** MongoDB (Atlas) for persistent storage.
* **Observability Pipeline:**
    * **Tracing:** OpenTelemetry (OTLP) → **Jaeger** (Visualizing request flows).
    * **Metrics:** **Prometheus** (Scraping system health) → **Grafana** (Dashboards).
    * **Logs:** **Promtail** (Log shipping) → **Loki** (Log aggregation).

---

## 🚀 Quick Start (One-Command Setup)

You do not need Node.js or MongoDB installed on your machine. You only need **Docker**.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/baya.git](https://github.com/yourusername/baya.git)
    cd baya
    ```

2.  **Create Environment File**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_atlas_connection_string
    JAEGER_ENDPOINT=http://jaeger:4318/v1/traces
    ```

3.  **Launch the Infrastructure**
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the Services**
    * **App (Frontend):** [http://localhost:5173](http://localhost:5173)
    * **Jaeger (Tracing):** [http://localhost:16686](http://localhost:16686)
    * **Grafana (Dashboards):** [http://localhost:3005](http://localhost:3005)
    * **Prometheus:** [http://localhost:9090](http://localhost:9090)

---

## 🕵️‍♂️ "The Glass Box": Observability

This project implements **OpenTelemetry** to provide full transparency into the backend's behavior.

### 1. Distributed Tracing (Jaeger)
Every API request is traced from the controller down to the database query.
* **How to test:** Vote on a poll in the UI.
* **See the trace:** Go to Jaeger, select `baya-api`, and click "Find Traces." You will see the exact execution time of the MongoDB operation and the broadcast event.

### 2. Centralized Logging (Loki)
Logs are not trapped inside containers. **Promtail** tails the Docker container logs and ships them to **Loki**, making them queryable in Grafana alongside metrics.

---

## 🧠 Engineering Highlights

### Solved: The "SPA Routing" Problem
**Challenge:** React Router works client-side, but refreshing `/dashboard` in a standard Docker container throws a 404 Nginx error.
**Solution:** Configured a custom `nginx.conf` with a `try_files $uri /index.html` directive to ensure Nginx hands control back to React for unknown routes.

### Solved: Container Networking & Telemetry
**Challenge:** The Backend service could not communicate with the Jaeger container due to isolated Docker networks (`ECONNREFUSED`).
**Solution:** Architected a unified bridge network in `docker-compose` and implemented dynamic environment variable injection (`JAEGER_ENDPOINT`) to allow the Node.js process to discover the tracing service via Docker DNS.

---

## 🔮 Future Improvements
* **CI/CD:** Implement GitHub Actions for automated testing and image building.
* **Kubernetes:** Migrate from Docker Compose to K8s for multi-node scaling.
* **Alerting:** Configure Grafana Alertmanager to notify on high error rates.

---

## 📜 License
MIT