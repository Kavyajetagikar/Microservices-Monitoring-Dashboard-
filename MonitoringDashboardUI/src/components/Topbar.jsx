import React, { useState } from "react";

export default function Topbar({
  activeTab,
  refreshInterval,
  setRefreshInterval,
  onRefreshNow,
  isRefreshing,
  lastUpdated,
  healthMap,
  isDemoMode,
  setIsDemoMode,
  openChaosModal,
}) {
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const viewTitles = {
    overview: {
      title: "System Overview",
      subtitle: "Unified telemetry and health status across all registered microservices",
    },
    health: {
      title: "Service Health & Actuators",
      subtitle: "Real-time heartbeat, latency pings, and Spring Boot Actuator probe inspection",
    },
    topology: {
      title: "Microservices Architecture Topology",
      subtitle: "Dynamic visual mesh map of API Gateway, Eureka Registry, and downstream services",
    },
    logs: {
      title: "Centralized Distributed Logs",
      subtitle: "Live event stream aggregator powered by Log-Service on port 8086",
    },
    analytics: {
      title: "Metrics & Performance Analytics",
      subtitle: "Latency distribution, throughput, and JVM memory telemetry powered by Recharts",
    },
    playground: {
      title: "Interactive API Playground",
      subtitle: "Send live HTTP requests to order, payment, and gateway endpoints directly from the browser",
    },
  };

  const currentView = viewTitles[activeTab] || viewTitles.overview;

  // Alerts
  const alerts = Object.values(healthMap).filter(
    (s) => s.status === "DOWN" || s.status === "UNAVAILABLE" || s.status === "DEGRADED"
  );

  return (
    <header className="topbar">
      <div className="topbar-title-section">
        <h1>{currentView.title}</h1>
        <p>{currentView.subtitle}</p>
      </div>

      <div className="topbar-actions">
        {/* Alerts Tray */}
        <div className="alert-tray-container">
          <button
            className={`btn-icon ${alerts.length > 0 ? "has-alerts" : ""}`}
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            title="System Alerts"
          >
            <span>🔔</span>
            {alerts.length > 0 && <span className="alert-counter">{alerts.length}</span>}
          </button>

          {showAlertMenu && (
            <div className="alerts-dropdown">
              <div className="dropdown-header">
                <strong>System Alerts ({alerts.length})</strong>
                <button className="btn-text" onClick={() => setShowAlertMenu(false)}>✕</button>
              </div>
              <div className="dropdown-body">
                {alerts.length === 0 ? (
                  <p className="empty-alerts">All systems operational. No active alerts.</p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="alert-item">
                      <span className="alert-icon">⚠️</span>
                      <div>
                        <strong>{alert.name} (Port {alert.port})</strong>
                        <p>{alert.status}: {alert.error || "Service is unreachable or unhealthy"}</p>
                        <small>{alert.timestamp}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Polling Interval Selector */}
        <div className="select-container">
          <label htmlFor="refresh-select">POLL:</label>
          <select
            id="refresh-select"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="select-input"
          >
            <option value={0}>Paused</option>
            <option value={3000}>Every 3s</option>
            <option value={5000}>Every 5s</option>
            <option value={10000}>Every 10s</option>
            <option value={30000}>Every 30s</option>
          </select>
        </div>

        {/* Manual Refresh Button */}
        <button
          className={`btn-primary refresh-button ${isRefreshing ? "refreshing" : ""}`}
          onClick={onRefreshNow}
          disabled={isRefreshing}
          title="Poll microservices immediately"
        >
          <span className="refresh-icon">↻</span>
          <span>{isRefreshing ? "Checking..." : "Refresh"}</span>
        </button>

        {/* Timestamp */}
        <div className="clock-pill">
          <span className="dot live-pulse"></span>
          <span>{lastUpdated ? `Updated ${lastUpdated}` : "Connecting..."}</span>
        </div>
      </div>
    </header>
  );
}
