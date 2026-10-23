import React, { useState } from "react";

export default function ServiceHealthView({
  services,
  healthMap,
  onPingService,
  onInspectService,
}) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);

  const filteredServices = services.filter((svc) => {
    const health = healthMap[svc.id] || { status: "CHECKING" };
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "UP" && health.status === "UP") ||
      (filterStatus === "DOWN" && (health.status === "DOWN" || health.status === "UNAVAILABLE"));

    const matchesSearch =
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.port.toString().includes(searchQuery) ||
      svc.role.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="view-container">
      {/* Control / Filter Bar */}
      <div className="filter-bar panel">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search service name, port, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="btn-clear" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-pills">
          <button
            className={`pill-btn ${filterStatus === "ALL" ? "active" : ""}`}
            onClick={() => setFilterStatus("ALL")}
          >
            All Services ({services.length})
          </button>
          <button
            className={`pill-btn ${filterStatus === "UP" ? "active" : ""}`}
            onClick={() => setFilterStatus("UP")}
          >
            🟢 UP ({Object.values(healthMap).filter((s) => s.status === "UP").length})
          </button>
          <button
            className={`pill-btn ${filterStatus === "DOWN" ? "active" : ""}`}
            onClick={() => setFilterStatus("DOWN")}
          >
            🔴 Issues ({Object.values(healthMap).filter((s) => s.status !== "UP").length})
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="service-cards-grid">
        {filteredServices.map((svc) => {
          const health = healthMap[svc.id] || { status: "CHECKING", latency: null };
          const isUp = health.status === "UP";
          const isChecking = health.status === "CHECKING";
          const isSimulated = health.isSimulated;

          return (
            <div key={svc.id} className="service-card panel">
              {/* Card Header */}
              <div className="card-top">
                <div className="card-identity">
                  <span
                    className="service-avatar"
                    style={{ backgroundColor: svc.color }}
                  >
                    {svc.code}
                  </span>
                  <div>
                    <h3>{svc.name}</h3>
                    <span className="card-tech">{svc.tech}</span>
                  </div>
                </div>

                <div className="card-status-col">
                  <span
                    className={`status-pill large ${
                      isUp ? "up" : isChecking ? "checking" : "down"
                    }`}
                  >
                    {health.status}
                  </span>
                  {isSimulated && <span className="sim-badge">SIMULATED</span>}
                </div>
              </div>

              {/* Role & Ports */}
              <p className="card-role-desc">{svc.role}</p>

              <div className="card-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">PORT</span>
                  <strong className="meta-value">:{svc.port}</strong>
                </div>

                <div className="meta-item">
                  <span className="meta-label">LATENCY</span>
                  <strong
                    className={`meta-value ${
                      health.latency && health.latency < 100
                        ? "text-green"
                        : health.latency && health.latency < 300
                        ? "text-yellow"
                        : "text-muted"
                    }`}
                  >
                    {health.latency !== null ? `${health.latency} ms` : "Offline"}
                  </strong>
                </div>

                <div className="meta-item">
                  <span className="meta-label">HEARTBEAT</span>
                  <strong className="meta-value">{health.timestamp || "—"}</strong>
                </div>
              </div>

              {/* Routing / Architecture Info */}
              <div className="routes-box">
                <span className="routes-title">ROUTES & BINDING</span>
                <div className="routes-list">
                  {svc.routes.map((r, i) => (
                    <code key={i}>{r}</code>
                  ))}
                </div>
              </div>

              {/* Exposed Actuator Endpoints */}
              <div className="endpoints-preview">
                <span className="routes-title">EXPOSED PROBES</span>
                <div className="endpoint-tags">
                  <a
                    href={`${svc.directUrl}${svc.healthEndpoint}`}
                    target="_blank"
                    rel="noreferrer"
                    className="endpoint-tag"
                  >
                    <span>GET</span> {svc.healthEndpoint} ↗
                  </a>
                  {svc.metricsEndpoint && (
                    <a
                      href={`${svc.directUrl}${svc.metricsEndpoint}`}
                      target="_blank"
                      rel="noreferrer"
                      className="endpoint-tag"
                    >
                      <span>GET</span> {svc.metricsEndpoint} ↗
                    </a>
                  )}
                  {svc.infoEndpoint && (
                    <a
                      href={`${svc.directUrl}${svc.infoEndpoint}`}
                      target="_blank"
                      rel="noreferrer"
                      className="endpoint-tag"
                    >
                      <span>GET</span> {svc.infoEndpoint} ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="card-footer-actions">
                <button
                  className="btn-outline"
                  onClick={() => onPingService(svc)}
                >
                  ⚡ Ping Now
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedServiceForModal({ svc, health })}
                >
                  🔍 Actuator Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actuator Inspection Modal */}
      {selectedServiceForModal && (
        <div className="modal-overlay" onClick={() => setSelectedServiceForModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  Actuator Probe: {selectedServiceForModal.svc.name} (Port{" "}
                  {selectedServiceForModal.svc.port})
                </h2>
                <p>Spring Boot Actuator Health & Subsystem Inspection</p>
              </div>
              <button
                className="btn-close"
                onClick={() => setSelectedServiceForModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-status-summary">
                <div className="summary-pill-group">
                  <span>Status:</span>
                  <span
                    className={`status-pill ${
                      selectedServiceForModal.health.status === "UP" ? "up" : "down"
                    }`}
                  >
                    {selectedServiceForModal.health.status}
                  </span>
                </div>
                <div>
                  <strong>Latency:</strong>{" "}
                  {selectedServiceForModal.health.latency !== null
                    ? `${selectedServiceForModal.health.latency} ms`
                    : "Unreachable"}
                </div>
                <div>
                  <strong>Mode:</strong>{" "}
                  {selectedServiceForModal.health.isSimulated ? "Demo Simulation" : "Live HTTP"}
                </div>
              </div>

              <div className="json-viewer-box">
                <div className="json-header">
                  <span>RESPONSE BODY (/actuator/health)</span>
                  <button
                    className="btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(
                          selectedServiceForModal.health.details || {
                            error: selectedServiceForModal.health.error,
                          },
                          null,
                          2
                        )
                      );
                    }}
                  >
                    Copy JSON
                  </button>
                </div>
                <pre>
                  {JSON.stringify(
                    selectedServiceForModal.health.details || {
                      status: selectedServiceForModal.health.status,
                      error: selectedServiceForModal.health.error,
                      hint:
                        "Ensure this microservice is launched via Spring Tool Suite (STS) or mvn spring-boot:run.",
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={() => {
                  onPingService(selectedServiceForModal.svc);
                  setSelectedServiceForModal(null);
                }}
              >
                Re-probe Service
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedServiceForModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
