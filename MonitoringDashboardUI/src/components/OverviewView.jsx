import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OverviewView({
  services,
  healthMap,
  telemetrySeries,
  recentLogs,
  setActiveTab,
  onPingService,
  isDemoMode,
  setIsDemoMode,
  openChaosModal,
}) {
  const upList = Object.values(healthMap).filter((s) => s.status === "UP");
  const downList = Object.values(healthMap).filter(
    (s) => s.status === "DOWN" || s.status === "UNAVAILABLE"
  );
  const upCount = upList.length;
  const downCount = downList.length;

  // Average Latency
  const activeLatencies = upList
    .map((s) => s.latency)
    .filter((l) => typeof l === "number" && l > 0);
  const avgLatency =
    activeLatencies.length > 0
      ? Math.round(
          activeLatencies.reduce((a, b) => a + b, 0) / activeLatencies.length
        )
      : 0;

  return (
    <div className="view-container">
      {/* Simulation Banner if offline and demo mode */}
      {isDemoMode && (
        <div className="demo-banner">
          <div className="banner-text">
            <strong>🎮 Demo Simulation Active:</strong> Displaying realistic telemetry, JVM metrics, and distributed logs.
            Toggle switch in sidebar to test against your real running Spring Boot services on localhost.
          </div>
          <button className="btn-banner-action" onClick={openChaosModal}>
            🧪 Test Fault Injection
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">TOTAL SERVICES</span>
            <span className="kpi-icon-pill">🏗️</span>
          </div>
          <div className="kpi-value">{services.length}</div>
          <span className="kpi-sub">Spring Boot & Eureka Cluster</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">HEALTHY SERVICES</span>
            <span className="kpi-icon-pill green">🟢</span>
          </div>
          <div className="kpi-value green">{upCount}</div>
          <span className="kpi-sub">
            {upCount === services.length
              ? "All services healthy"
              : `${services.length - upCount} service(s) need attention`}
          </span>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">OFFLINE / DOWN</span>
            <span className="kpi-icon-pill red">🔴</span>
          </div>
          <div className={`kpi-value ${downCount > 0 ? "red" : "muted"}`}>
            {downCount}
          </div>
          <span className="kpi-sub">
            {downCount > 0 ? "Connectivity issues detected" : "Zero system errors"}
          </span>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">AVG RESPONSE TIME</span>
            <span className="kpi-icon-pill blue">⚡</span>
          </div>
          <div className="kpi-value blue">
            {avgLatency > 0 ? `${avgLatency} ms` : "—"}
          </div>
          <span className="kpi-sub">Round-trip actuator latency</span>
        </div>
      </section>

      {/* Main Grid: Live Health Matrix & Latency Chart */}
      <div className="overview-two-col">
        {/* Left Col: Live Health Matrix */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Microservices Status Matrix</h2>
              <p>Real-time heartbeat & port configuration</p>
            </div>
            <button
              className="btn-text-action"
              onClick={() => setActiveTab("health")}
            >
              View All Details →
            </button>
          </div>

          <div className="service-matrix-list">
            {services.map((svc) => {
              const health = healthMap[svc.id] || { status: "CHECKING", latency: null };
              const isUp = health.status === "UP";
              const isChecking = health.status === "CHECKING";

              return (
                <div key={svc.id} className="service-matrix-item">
                  <div className="matrix-left">
                    <span
                      className="service-badge-indicator"
                      style={{ backgroundColor: svc.color }}
                    >
                      {svc.code}
                    </span>
                    <div className="matrix-info">
                      <strong>{svc.name}</strong>
                      <span className="matrix-sub">
                        Port <code>{svc.port}</code> · {svc.role}
                      </span>
                    </div>
                  </div>

                  <div className="matrix-right">
                    {health.latency !== null && (
                      <span className="latency-pill">
                        {health.latency} ms
                      </span>
                    )}

                    <span
                      className={`status-pill ${
                        isUp ? "up" : isChecking ? "checking" : "down"
                      }`}
                    >
                      {health.status}
                    </span>

                    <button
                      className="btn-sm"
                      onClick={() => onPingService(svc)}
                      title="Ping this service"
                    >
                      Ping
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Col: Latency Trend Chart */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Cluster Latency Trend</h2>
              <p>Rolling round-trip latency over time (ms)</p>
            </div>
            <button
              className="btn-text-action"
              onClick={() => setActiveTab("analytics")}
            >
              Analytics Tab →
            </button>
          </div>

          <div className="chart-container" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetrySeries}>
                <defs>
                  <linearGradient id="orderColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gatewayColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: "8px",
                    color: "#f4f4f5",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gatewayLatency"
                  name="API Gateway (ms)"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#gatewayColor)"
                />
                <Area
                  type="monotone"
                  dataKey="orderLatency"
                  name="Order Service (ms)"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#orderColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Bottom Section: Recent Logs & Quick Actions */}
      <div className="overview-two-col">
        {/* Recent Events / Logs */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent System Events</h2>
              <p>Latest log events from Log Service (Port 8086)</p>
            </div>
            <button
              className="btn-text-action"
              onClick={() => setActiveTab("logs")}
            >
              Open Log Explorer →
            </button>
          </div>

          <div className="recent-logs-list">
            {recentLogs.slice(0, 5).map((log, idx) => (
              <div key={log.id || idx} className="recent-log-row">
                <span className={`log-level-pill ${log.level?.toLowerCase()}`}>
                  {log.level}
                </span>
                <span className="log-service-tag">{log.service}</span>
                <span className="log-msg-preview">{log.message}</span>
                <span className="log-time">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Launch & Actions */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Quick Interactive Tools</h2>
              <p>Instant shortcuts to test and diagnose your stack</p>
            </div>
          </div>

          <div className="quick-actions-grid">
            <button
              className="quick-action-card"
              onClick={() => setActiveTab("topology")}
            >
              <span className="action-icon">🔀</span>
              <div className="action-info">
                <strong>View Architecture Mesh</strong>
                <p>Interactive graph showing Gateway, Eureka, and routing paths</p>
              </div>
            </button>

            <button
              className="quick-action-card"
              onClick={() => setActiveTab("playground")}
            >
              <span className="action-icon">⚡</span>
              <div className="action-info">
                <strong>Test API Endpoints</strong>
                <p>Send requests to /api/orders, /payments, and /actuator live</p>
              </div>
            </button>

            <button
              className="quick-action-card"
              onClick={() => setActiveTab("logs")}
            >
              <span className="action-icon">✍️</span>
              <div className="action-info">
                <strong>Emit Custom Log</strong>
                <p>POST a test audit or error log to Log Service (port 8086)</p>
              </div>
            </button>

            <button
              className="quick-action-card"
              onClick={openChaosModal}
            >
              <span className="action-icon">🧪</span>
              <div className="action-info">
                <strong>Simulate Failure / Outage</strong>
                <p>Inject latency spikes or take a service offline to test alerts</p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
