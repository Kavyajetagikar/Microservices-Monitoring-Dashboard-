# PulseMonitor · Microservices Observability Dashboard

A modern, interactive, full-featured DevOps monitoring dashboard built with React 19, Vite, and Recharts for Spring Boot microservices.

## Architecture Overview

```mermaid
graph TD
    Client[Browser / SPA UI] -->|Port 3000| ViteProxy[Vite Dev Server Reverse Proxy]
    ViteProxy -->|/proxy/gateway| Gateway[API Gateway :8080]
    ViteProxy -->|/proxy/eureka| Eureka[Eureka Server :8761]
    ViteProxy -->|/proxy/order| Order[Order Service :8081]
    ViteProxy -->|/proxy/payment| Payment[Payment Service :8082]
    ViteProxy -->|/proxy/log| Log[Log Service :8086]

    Gateway -->|Service Discovery| Eureka
    Order -->|Heartbeat| Eureka
    Payment -->|Heartbeat| Eureka
    Log -->|Heartbeat| Eureka

    Gateway -->|/api/orders/**| Order
    Order -.->|RPC /payments/{id}| Payment
    Order -.->|POST /logs| Log
    Payment -.->|POST /logs| Log
```

---

## Key Features

1. **Dashboard Overview (`▦`)**:
   - Executive KPIs: Total Services, Healthy Services, Offline/Down Services, and Cluster Round-Trip Average Latency.
   - Microservices Status Matrix with live heartbeat indicators and instant per-service "Ping" trigger.
   - Real-time rolling Latency Trend chart (Recharts AreaChart).
   - Recent system events stream from `Log-Service`.
   - Quick launch action cards.

2. **Service Health & Actuators (`◉`)**:
   - Deep inspection cards for all 5 services: API Gateway (8080), Eureka Server (8761), Order Service (8081), Payment Service (8082), Log Service (8086).
   - Real-time latency measurement in milliseconds.
   - One-click "Ping Now" heartbeat tester.
   - "Actuator Details" inspection modal displaying JSON health breakdown (diskSpace, ping, discoveryClient).
   - Filter by status (`All`, `UP`, `Issues`) and search by service name or port.

3. **Architecture Topology (`🔀`)**:
   - Dynamic SVG topology diagram with animated packet flows and glowing status indicators.
   - Clickable service nodes displaying the interactive "Node Inspector" panel with port, role, routes, and probe actions.

4. **Centralized Distributed Logs (`▤`)**:
   - Real-time log terminal feed matching `log-service`'s API (`/logs` GET & POST).
   - Filter logs by Level (`INFO`, `WARN`, `ERROR`, `DEBUG`) and Microservice.
   - Full-text search with highlighting.
   - "Emit New Log" modal to send new events directly to `log-service` via `POST /logs`.
   - Download logs as JSON and clear logs button.

5. **Metrics & Performance Analytics (`▥`)**:
   - Round-trip latency timeline (LineChart comparing Gateway, Order, Payment, and Log services).
   - Ingress throughput requests/sec (AreaChart).
   - JVM Memory Allocation (BarChart of used vs. maximum heap MB).
   - HTTP Response Code Distribution (Donut chart for 200, 201, 400, 404, 500).

6. **Interactive API Playground (`⚡`)**:
   - Preconfigured requests for `/api/orders`, `/api/orders/status`, `/payments/101`, `/payments/health`, `/logs`, and `/actuator/health`.
   - Custom HTTP request builder supporting `GET`, `POST`, `PUT`, `DELETE` with JSON request body editor.
   - Live Response Inspector with HTTP status code badge, latency timer in ms, headers table, and syntax-highlighted formatted JSON response with copy button.

7. **Fault & Chaos Engineering Lab (`🧪`)**:
   - Simulate service outages (`Kill Service`) or high latency spikes (`850ms - 1500ms`) or cascade failures.
   - Test dashboard reactivity, status badges, and alert banners in real-time.

8. **Live Backend & Demo Simulation Modes**:
   - **🟢 Live Microservices**: Connects directly to localhost ports with reverse proxy support to eliminate CORS issues.
   - **🎮 Demo Simulation**: Provides rich telemetry and realistic behavior so the UI is immediately testable even without all Spring Boot apps running.

---

## How to Run the Dashboard

1. Navigate to the UI directory:
   ```bash
   cd "monitoring-dashboard-ui"
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser:
   ```
   http://localhost:3000
   ```
