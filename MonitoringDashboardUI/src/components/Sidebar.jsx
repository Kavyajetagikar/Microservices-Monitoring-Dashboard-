import React from "react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  services,
  healthMap,
  isDemoMode,
  setIsDemoMode,
  logsCount,
  openChaosModal,
}) {
  const upCount = Object.values(healthMap).filter((s) => s.status === "UP").length;
  const downCount = Object.values(healthMap).filter(
    (s) => s.status === "DOWN" || s.status === "UNAVAILABLE"
  ).length;

  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: "▦", badge: null },
    {
      id: "health",
      label: "Service Health",
      icon: "◉",
      badge: downCount > 0 ? `${downCount} Alert` : `${upCount}/${services.length}`,
      badgeColor: downCount > 0 ? "badge-danger" : "badge-success",
    },
    { id: "topology", label: "Architecture Topology", icon: "🔀", badge: "Live Mesh" },
    { id: "logs", label: "Centralized Logs", icon: "▤", badge: logsCount > 0 ? `${logsCount}` : null },
    { id: "analytics", label: "Metrics & Analytics", icon: "▥", badge: "Recharts" },
    { id: "playground", label: "API Playground", icon: "⚡", badge: "REST" },
    { id: "chaos", label: "Fault & Chaos Lab", icon: "🧪", badge: "Sim", onClick: openChaosModal },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <span className="pulse-dot"></span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div>
          <h2>Pulse<span>Monitor</span></h2>
          <span className="brand-badge">MICROSERVICES v2.0</span>
        </div>
      </div>

      <div className="mode-toggle-card">
        <div className="mode-label-row">
          <span className="mode-title">{isDemoMode ? "🎮 Demo Simulation" : "🟢 Live Microservices"}</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => setIsDemoMode(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <p className="mode-desc">
          {isDemoMode
            ? "Simulating live actuator metrics, logs, and traffic."
            : "Querying localhost:8080, 8081, 8082, 8086, 8761."}
        </p>
      </div>

      <nav className="nav-menu">
        <p className="nav-group-title">OBSERVABILITY</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-button ${activeTab === item.id ? "active" : ""}`}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else {
                setActiveTab(item.id);
              }
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className={`nav-badge ${item.badgeColor || "badge-neutral"}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-cluster-info">
        <div className="cluster-header">
          <span>CLUSTER HEALTH</span>
          <span className={`status-pill ${downCount === 0 ? "up" : "degraded"}`}>
            {downCount === 0 ? "HEALTHY" : "DEGRADED"}
          </span>
        </div>
        <div className="cluster-bar">
          <div
            className="cluster-bar-fill"
            style={{ width: `${(upCount / services.length) * 100}%` }}
          ></div>
        </div>
        <div className="cluster-stats">
          <span>{upCount} of {services.length} Online</span>
          <span>{Math.round((upCount / services.length) * 100)}%</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <p className="credit">Spring Cloud · Netflix Eureka · Actuator</p>
      </div>
    </aside>
  );
}
