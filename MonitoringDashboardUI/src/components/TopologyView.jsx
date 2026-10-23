import React, { useState } from "react";
import { TOPOLOGY_DATA } from "../data/mockData";

export default function TopologyView({
  services,
  healthMap,
  onPingService,
  setActiveTab,
}) {
  const [selectedNode, setSelectedNode] = useState(TOPOLOGY_DATA.nodes[1]); // Default to Gateway

  const getNodeHealth = (nodeId) => {
    if (nodeId === "client") return { status: "UP", latency: 5 };
    const svc = services.find((s) => s.id.includes(nodeId));
    if (svc) {
      return healthMap[svc.id] || { status: "CHECKING", latency: null };
    }
    return { status: "UP", latency: 20 };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "UP":
        return "#10b981"; // emerald
      case "DEGRADED":
        return "#f59e0b"; // amber
      case "DOWN":
      case "UNAVAILABLE":
        return "#ef4444"; // red
      default:
        return "#6366f1"; // indigo
    }
  };

  return (
    <div className="view-container">
      <div className="topology-layout">
        {/* Topology Diagram Canvas */}
        <div className="panel topology-canvas-panel">
          <div className="panel-heading">
            <div>
              <h2>Live Architecture Mesh</h2>
              <p>Dynamic routing topology & service registration bindings</p>
            </div>
            <div className="topology-legend">
              <span className="legend-item">
                <span className="legend-dot green"></span> Healthy (UP)
              </span>
              <span className="legend-item">
                <span className="legend-dot red"></span> Unhealthy / Down
              </span>
              <span className="legend-item">
                <span className="legend-line animated"></span> Active Traffic
              </span>
              <span className="legend-item">
                <span className="legend-line dashed"></span> Registry Heartbeat
              </span>
            </div>
          </div>

          <div className="topology-canvas-container">
            <svg className="topology-svg" viewBox="0 0 740 420">
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#232736" strokeWidth="0.8" />
                </pattern>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edge Connections */}
              {/* Client -> Gateway */}
              <line
                x1="120"
                y1="220"
                x2="230"
                y2="220"
                className="edge-line flow-active"
                stroke="#6366f1"
                strokeWidth="2.5"
              />
              <text x="175" y="210" className="edge-text" textAnchor="middle">
                HTTP Client
              </text>

              {/* Gateway <-> Eureka */}
              <line
                x1="290"
                y1="190"
                x2="290"
                y2="90"
                className="edge-line flow-dashed"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text x="320" y="140" className="edge-text" textAnchor="start">
                Lookup Registry
              </text>

              {/* Gateway -> Order Service */}
              <path
                d="M 350 210 C 420 210, 420 120, 490 120"
                className="edge-line flow-active"
                stroke="#10b981"
                strokeWidth="2.5"
                fill="none"
              />
              <text x="420" y="150" className="edge-text" textAnchor="middle">
                /api/orders/**
              </text>

              {/* Order Service -> Payment Service */}
              <line
                x1="550"
                y1="150"
                x2="550"
                y2="200"
                className="edge-line flow-active"
                stroke="#ec4899"
                strokeWidth="2"
              />
              <text x="590" y="180" className="edge-text" textAnchor="start">
                /payments/&#123;id&#125;
              </text>

              {/* Order & Payment -> Log Service */}
              <path
                d="M 550 260 C 550 280, 550 290, 550 310"
                className="edge-line flow-active"
                stroke="#8b5cf6"
                strokeWidth="2"
                fill="none"
              />
              <text x="590" y="290" className="edge-text" textAnchor="start">
                POST /logs
              </text>

              {/* Eureka Heartbeat Lines */}
              <path
                d="M 490 100 C 400 60, 360 60, 350 60"
                className="edge-line flow-dashed"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                fill="none"
              />
            </svg>

            {/* Interactive Nodes Placed Absolutely Over Canvas */}
            <div className="nodes-layer">
              {TOPOLOGY_DATA.nodes.map((node) => {
                const health = getNodeHealth(node.id);
                const isSelected = selectedNode?.id === node.id;
                const statusColor = getStatusColor(health.status);

                return (
                  <div
                    key={node.id}
                    className={`topology-node-card ${isSelected ? "selected" : ""}`}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      borderColor: isSelected ? statusColor : "rgba(255,255,255,0.12)",
                    }}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="node-avatar-row">
                      <span className="node-icon">{node.icon}</span>
                      <span
                        className="node-status-glow"
                        style={{
                          backgroundColor: statusColor,
                          boxShadow: `0 0 10px ${statusColor}`,
                        }}
                      ></span>
                    </div>

                    <strong className="node-title">{node.label}</strong>
                    <div className="node-badges">
                      <span className="node-badge-port">{node.badge}</span>
                      {health.latency !== null && (
                        <span className="node-badge-latency">
                          {health.latency}ms
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Node Details Inspector */}
        <aside className="panel topology-inspector">
          <div className="panel-heading">
            <div>
              <h2>Node Inspector</h2>
              <p>Selected service metadata</p>
            </div>
          </div>

          {selectedNode ? (
            <div className="inspector-content">
              <div className="inspector-header">
                <span className="inspector-icon">{selectedNode.icon}</span>
                <div>
                  <h3>{selectedNode.label}</h3>
                  <span className="status-pill up">
                    {getNodeHealth(selectedNode.id).status}
                  </span>
                </div>
              </div>

              <div className="inspector-field">
                <span className="field-label">NODE TYPE</span>
                <span className="field-value uppercase">{selectedNode.type}</span>
              </div>

              {selectedNode.port && (
                <div className="inspector-field">
                  <span className="field-label">ASSIGNED PORT</span>
                  <code className="field-value">:{selectedNode.port}</code>
                </div>
              )}

              <div className="inspector-field">
                <span className="field-label">LIVE LATENCY</span>
                <span className="field-value">
                  {getNodeHealth(selectedNode.id).latency !== null
                    ? `${getNodeHealth(selectedNode.id).latency} ms`
                    : "Unreachable"}
                </span>
              </div>

              <div className="inspector-field">
                <span className="field-label">ARCHITECTURE ROLE</span>
                <p className="field-desc">
                  {selectedNode.id === "gateway"
                    ? "Entrypoint into the microservice fabric. Forwards requests matching /api/orders/** to Order Service using client-side load balancing via Eureka."
                    : selectedNode.id === "eureka"
                    ? "Central Service Registry running on port 8761. Microservices register their hostname and ports upon startup to facilitate discovery."
                    : selectedNode.id === "order"
                    ? "Manages e-commerce orders on port 8081. Interacts with Payment Service and pushes audit logs to Log Service."
                    : selectedNode.id === "payment"
                    ? "Handles transaction inquiries and processing on port 8082."
                    : selectedNode.id === "log"
                    ? "Distributed log collector on port 8086 with REST API for centralized observability."
                    : "Client layer initiating HTTP requests to the cluster."}
                </p>
              </div>

              <div className="inspector-actions">
                {selectedNode.port && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const svc = services.find((s) => s.port === selectedNode.port);
                      if (svc) onPingService(svc);
                    }}
                  >
                    ⚡ Probe Heartbeat
                  </button>
                )}

                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab("playground")}
                >
                  ⚡ Test in API Playground
                </button>
              </div>
            </div>
          ) : (
            <p className="empty-alerts">Click on any node in the topology to inspect details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
