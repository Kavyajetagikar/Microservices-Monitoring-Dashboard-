import React, { useState } from "react";
import { executeApiTest } from "../services/api";

const PRESET_REQUESTS = [
  {
    id: "get-orders-gateway",
    label: "Gateway -> Get Orders",
    service: "API Gateway (8080)",
    method: "GET",
    url: "/proxy/gateway/api/orders",
    directUrl: "http://localhost:8080/api/orders",
    desc: "Routed through API Gateway (port 8080) to Order Service via Eureka",
    body: null,
  },
  {
    id: "get-orders-direct",
    label: "Order Service -> All Orders",
    service: "Order Service (8081)",
    method: "GET",
    url: "/proxy/order/api/orders",
    directUrl: "http://localhost:8081/api/orders",
    desc: "Direct query to Order Service endpoint returning John, Smith, Blake orders",
    body: null,
  },
  {
    id: "post-order-mysql",
    label: "Order Service -> Create Order (MySQL)",
    service: "Order Service (8081)",
    method: "POST",
    url: "/proxy/order/api/orders",
    directUrl: "http://localhost:8081/api/orders",
    desc: "Inserts a new persistent order entity into the MySQL orders_db database",
    body: JSON.stringify(
      {
        customer: "Omkar",
        amount: 3200.0,
        status: "CONFIRMED"
      },
      null,
      2
    ),
  },
  {
    id: "get-orders-status",
    label: "Order Service -> Status Ping",
    service: "Order Service (8081)",
    method: "GET",
    url: "/proxy/order/api/orders/status",
    directUrl: "http://localhost:8081/api/orders/status",
    desc: "Returns simple status string: 'Order Service is running'",
    body: null,
  },
  {
    id: "get-payment-101",
    label: "Payment Service -> Check Order #101",
    service: "Payment Service (8082)",
    method: "GET",
    url: "/proxy/payment/payments/101",
    directUrl: "http://localhost:8082/payments/101",
    desc: "Query transaction record for Order #101 returning SUCCESS confirmation",
    body: null,
  },
  {
    id: "get-payment-health",
    label: "Payment Service -> Custom Health",
    service: "Payment Service (8082)",
    method: "GET",
    url: "/proxy/payment/payments/health",
    directUrl: "http://localhost:8082/payments/health",
    desc: "Custom health controller endpoint defined in PaymentController.java",
    body: null,
  },
  {
    id: "get-logs",
    label: "Log Service -> Fetch Central Logs",
    service: "Log Service (8086)",
    method: "GET",
    url: "/proxy/log/logs",
    directUrl: "http://localhost:8086/logs",
    desc: "Retrieves all captured distributed logs from LogController in-memory store",
    body: null,
  },
  {
    id: "post-log",
    label: "Log Service -> Post New Event",
    service: "Log Service (8086)",
    method: "POST",
    url: "/proxy/log/logs",
    directUrl: "http://localhost:8086/logs",
    desc: "Appends a new event to Log Service with level, service, and message",
    body: JSON.stringify(
      {
        level: "INFO",
        service: "API Playground",
        message: "Interactive test probe dispatched from frontend UI",
      },
      null,
      2
    ),
  },
  {
    id: "actuator-health",
    label: "Order Service -> Actuator Health",
    service: "Order Service (8081)",
    method: "GET",
    url: "/proxy/order/actuator/health",
    directUrl: "http://localhost:8081/actuator/health",
    desc: "Spring Boot Actuator full subsystem health probe",
    body: null,
  },
];

export default function ApiPlaygroundView({ isDemoMode }) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_REQUESTS[0].id);
  const [method, setMethod] = useState(PRESET_REQUESTS[0].method);
  const [url, setUrl] = useState(PRESET_REQUESTS[0].url);
  const [requestBody, setRequestBody] = useState(PRESET_REQUESTS[0].body || "");
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState(null);
  const [activeTab, setActiveTab] = useState("body"); // 'body' | 'headers'
  const [copied, setCopied] = useState(false);

  const applyPreset = (presetId) => {
    const preset = PRESET_REQUESTS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(preset.id);
    setMethod(preset.method);
    setUrl(preset.url);
    setRequestBody(preset.body || "");
    setResponseResult(null);
  };

  const handleSend = async () => {
    setIsLoading(true);
    setResponseResult(null);

    // If Demo Mode and target microservice is offline, we provide simulated response
    const res = await executeApiTest(method, url, requestBody);

    if (!res.success && isDemoMode) {
      // Generate realistic demo response matching the endpoint
      let demoBody = {};
      if (url.includes("/api/orders/status")) {
        demoBody = "Order Service is running (Simulated Response)";
      } else if (url.includes("/api/orders")) {
        demoBody = [
          { orderId: 101, customer: "John", amount: 1500, status: "CONFIRMED" },
          { orderId: 102, customer: "Smith", amount: 2500, status: "PROCESSING" },
          { orderId: 103, customer: "Blake", amount: 900, status: "DELIVERED" },
        ];
      } else if (url.includes("/payments/101")) {
        demoBody = {
          paymentId: 1001,
          orderId: 101,
          paymentStatus: "SUCCESS",
          message: "Demo payment processed successfully (Simulated Response)",
        };
      } else if (url.includes("/payments/health")) {
        demoBody = { service: "Payment Service", status: "UP" };
      } else if (url.includes("/logs")) {
        demoBody = [
          { timestamp: new Date().toISOString(), level: "INFO", service: "Order Service", message: "Order service started" },
          { timestamp: new Date().toISOString(), level: "INFO", service: "Payment Service", message: "Payment service started" },
        ];
      } else {
        demoBody = {
          status: "UP",
          components: { ping: { status: "UP" }, diskSpace: { status: "UP" } },
        };
      }

      setResponseResult({
        success: true,
        status: 200,
        statusText: "OK (Simulated)",
        latency: Math.floor(12 + Math.random() * 25),
        data: demoBody,
        headers: {
          "content-type": "application/json",
          "x-powered-by": "Spring Boot / Mock Sandbox",
        },
      });
    } else {
      setResponseResult(res);
    }

    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (!responseResult?.data) return;
    navigator.clipboard.writeText(
      typeof responseResult.data === "string"
        ? responseResult.data
        : JSON.stringify(responseResult.data, null, 2)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="view-container">
      <div className="playground-layout">
        {/* Left Side: Presets & Request Builder */}
        <div className="playground-left">
          {/* Preset Buttons */}
          <div className="panel preset-panel">
            <div className="panel-heading">
              <div>
                <h2>Interactive Endpoints</h2>
                <p>Pick any preconfigured microservice endpoint</p>
              </div>
            </div>

            <div className="preset-list">
              {PRESET_REQUESTS.map((preset) => (
                <button
                  key={preset.id}
                  className={`preset-item-btn ${selectedPreset === preset.id ? "active" : ""}`}
                  onClick={() => applyPreset(preset.id)}
                >
                  <div className="preset-item-top">
                    <span className={`method-badge ${preset.method.toLowerCase()}`}>
                      {preset.method}
                    </span>
                    <strong>{preset.label}</strong>
                  </div>
                  <span className="preset-item-desc">{preset.desc}</span>
                  <span className="preset-item-url">{preset.url}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Request Form */}
          <div className="panel request-builder-panel">
            <div className="panel-heading">
              <div>
                <h2>Request Configuration</h2>
                <p>Adjust method, headers, or parameters</p>
              </div>
            </div>

            <div className="request-input-row">
              <select
                className="select-input method-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                className="url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/proxy/order/api/orders or http://localhost:8081/api/orders"
              />

              <button
                className="btn-primary send-btn"
                onClick={handleSend}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "⚡ Send"}
              </button>
            </div>

            {method === "POST" && (
              <div className="body-editor-section">
                <label>JSON Request Body</label>
                <textarea
                  className="textarea-input monospace"
                  rows={5}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Response Inspector */}
        <div className="playground-right">
          <div className="panel response-inspector-panel">
            <div className="panel-heading">
              <div>
                <h2>HTTP Response Inspector</h2>
                <p>Real-time server response, latency, and payload</p>
              </div>

              {responseResult && (
                <div className="response-meta-pills">
                  <span
                    className={`status-pill ${
                      responseResult.status >= 200 && responseResult.status < 300
                        ? "up"
                        : "down"
                    }`}
                  >
                    {responseResult.status} {responseResult.statusText}
                  </span>
                  <span className="latency-pill">{responseResult.latency} ms</span>
                </div>
              )}
            </div>

            {responseResult ? (
              <div className="response-content">
                <div className="response-tab-row">
                  <button
                    className={`tab-btn ${activeTab === "body" ? "active" : ""}`}
                    onClick={() => setActiveTab("body")}
                  >
                    Response Body
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "headers" ? "active" : ""}`}
                    onClick={() => setActiveTab("headers")}
                  >
                    Headers ({Object.keys(responseResult.headers || {}).length})
                  </button>
                  <button className="btn-sm copy-btn" onClick={copyToClipboard}>
                    {copied ? "Copied!" : "📋 Copy"}
                  </button>
                </div>

                <div className="response-body-area">
                  {activeTab === "body" ? (
                    <pre className="json-output">
                      {typeof responseResult.data === "string"
                        ? responseResult.data
                        : JSON.stringify(responseResult.data, null, 2)}
                    </pre>
                  ) : (
                    <div className="headers-table">
                      {Object.entries(responseResult.headers || {}).map(([k, v]) => (
                        <div key={k} className="header-row">
                          <code>{k}</code>
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-response-state">
                <span className="empty-icon">⚡</span>
                <p>No response yet.</p>
                <small>Select an endpoint on the left and click "Send" to execute a live request.</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
