import React from "react";

export default function ChaosModal({
  isOpen,
  onClose,
  services,
  chaosOverrides,
  setChaosOverrides,
  onApplyChaos,
  onResetChaos,
}) {
  if (!isOpen) return null;

  const handleSetServiceState = (serviceId, state, customLatency = null) => {
    setChaosOverrides((prev) => {
      if (state === "NORMAL") {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return {
        ...prev,
        [serviceId]: {
          status: state,
          latency: customLatency ?? (state === "DEGRADED" ? 950 : 0),
        },
      };
    });
  };

  const handlePreset = (type) => {
    if (type === "RESET") {
      onResetChaos();
    } else if (type === "ORDER_DOWN") {
      setChaosOverrides({
        "order-service": { status: "DOWN", latency: 0 },
      });
      onApplyChaos();
    } else if (type === "LATENCY_SPIKE") {
      setChaosOverrides({
        "order-service": { status: "DEGRADED", latency: 1250 },
        "payment-service": { status: "DEGRADED", latency: 890 },
      });
      onApplyChaos();
    } else if (type === "CASCADE") {
      setChaosOverrides({
        "eureka-server": { status: "DOWN", latency: 0 },
        "order-service": { status: "DOWN", latency: 0 },
        "payment-service": { status: "DOWN", latency: 0 },
      });
      onApplyChaos();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chaos-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="chaos-icon">🧪</span>
            <div>
              <h2>Fault & Chaos Engineering Lab</h2>
              <p>Simulate service outages and latency spikes to test dashboard reactivity</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Quick Preset Buttons */}
          <div className="chaos-presets-bar">
            <span className="preset-label">SCENARIOS:</span>
            <button
              className="btn-outline-sm"
              onClick={() => handlePreset("ORDER_DOWN")}
            >
              🔥 Kill Order Service
            </button>
            <button
              className="btn-outline-sm"
              onClick={() => handlePreset("LATENCY_SPIKE")}
            >
              🐌 Latency Degradation
            </button>
            <button
              className="btn-danger-outline-sm"
              onClick={() => handlePreset("CASCADE")}
            >
              💥 Cascade Outage
            </button>
            <button
              className="btn-success-outline-sm"
              onClick={() => handlePreset("RESET")}
            >
              ✅ Restore All Normal
            </button>
          </div>

          {/* Per-service controls */}
          <div className="chaos-services-list">
            {services.map((svc) => {
              const currentOverride = chaosOverrides[svc.id]?.status || "NORMAL";

              return (
                <div key={svc.id} className="chaos-row">
                  <div className="chaos-service-name">
                    <span
                      className="service-badge-indicator sm"
                      style={{ backgroundColor: svc.color }}
                    >
                      {svc.code}
                    </span>
                    <div>
                      <strong>{svc.name}</strong>
                      <span className="chaos-port">Port :{svc.port}</span>
                    </div>
                  </div>

                  <div className="chaos-state-buttons">
                    <button
                      className={`btn-chaos ${currentOverride === "NORMAL" ? "active-normal" : ""}`}
                      onClick={() => handleSetServiceState(svc.id, "NORMAL")}
                    >
                      🟢 Normal (UP)
                    </button>
                    <button
                      className={`btn-chaos ${currentOverride === "DEGRADED" ? "active-degraded" : ""}`}
                      onClick={() => handleSetServiceState(svc.id, "DEGRADED", 850)}
                    >
                      🟡 Degraded (850ms)
                    </button>
                    <button
                      className={`btn-chaos ${currentOverride === "DOWN" ? "active-down" : ""}`}
                      onClick={() => handleSetServiceState(svc.id, "DOWN", 0)}
                    >
                      🔴 Force Kill (DOWN)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-primary"
            onClick={() => {
              onApplyChaos();
              onClose();
            }}
          >
            Apply & Test Dashboard
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
