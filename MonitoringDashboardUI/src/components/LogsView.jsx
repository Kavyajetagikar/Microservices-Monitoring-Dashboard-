import React, { useState, useEffect, useRef } from "react";
import { submitLogToBackend } from "../services/api";

export default function LogsView({
  logs,
  setLogs,
  services,
  isDemoMode,
}) {
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmitModal, setShowEmitModal] = useState(false);

  // New Log Form State
  const [newLogService, setNewLogService] = useState("Order Service");
  const [newLogLevel, setNewLogLevel] = useState("INFO");
  const [newLogMessage, setNewLogMessage] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEmitLog = async (e) => {
    e.preventDefault();
    if (!newLogMessage.trim()) return;

    setIsSubmitting(true);
    const payload = {
      level: newLogLevel,
      service: newLogService,
      message: newLogMessage.trim(),
    };

    try {
      const res = await submitLogToBackend(payload, isDemoMode);
      if (res.success && res.log) {
        setLogs((prev) => [res.log, ...prev]);
        setNewLogMessage("");
        setShowEmitModal(false);
        showToast(
          res.isLive
            ? `Log successfully pushed to Log Service (port 8086)!`
            : `Log created in local/demo buffer!`
        );
      }
    } catch {
      showToast("Failed to submit log entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesLevel =
      selectedLevel === "ALL" ||
      log.level?.toUpperCase() === selectedLevel.toUpperCase();

    const matchesService =
      selectedService === "ALL" ||
      log.service?.toLowerCase().includes(selectedService.toLowerCase());

    const matchesSearch =
      !searchTerm ||
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.traceId?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLevel && matchesService && matchesSearch;
  });

  const exportLogsAsJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `microservice-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="view-container">
      {/* Toast Notification */}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* Control Toolbar */}
      <div className="panel log-toolbar">
        <div className="toolbar-row">
          {/* Search */}
          <div className="search-box">
            <span>🔎</span>
            <input
              type="text"
              placeholder="Search logs by message, service, or trace ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="btn-clear" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>

          {/* Level Filter */}
          <div className="select-container">
            <label>LEVEL:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="select-input"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="select-container">
            <label>SERVICE:</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="select-input"
            >
              <option value="ALL">All Services</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.name}>
                  {svc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="toolbar-actions">
            <label className="toggle-label" title="Keep view scrolled to latest log">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              <span>Auto-scroll</span>
            </label>

            <button
              className="btn-outline"
              onClick={exportLogsAsJson}
              title="Download filtered logs as JSON"
            >
              💾 Export JSON
            </button>

            <button
              className="btn-danger-outline"
              onClick={() => setLogs([])}
              title="Clear log buffer"
            >
              🗑️ Clear
            </button>

            <button
              className="btn-primary"
              onClick={() => setShowEmitModal(true)}
            >
              ✍️ Emit New Log
            </button>
          </div>
        </div>
      </div>

      {/* Logs Feed Container */}
      <div className="panel terminal-feed-panel">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot-red"></span>
            <span className="dot-yellow"></span>
            <span className="dot-green"></span>
          </div>
          <span className="terminal-title">
            log-stream: ~ stdout/stderr · Showing {filteredLogs.length} of {logs.length} events
          </span>
          <span className="terminal-endpoint">Target: port 8086 /logs</span>
        </div>

        <div className="terminal-body">
          {filteredLogs.length === 0 ? (
            <div className="empty-logs">
              <p>No log records match the current filter criteria.</p>
              <small>Try selecting "All Levels" or emit a test log above.</small>
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={log.id || idx} className="terminal-row">
                <span className="term-time">{log.timestamp || "just now"}</span>
                <span className={`term-level ${log.level?.toLowerCase()}`}>
                  [{log.level}]
                </span>
                <span className="term-service">{log.service}</span>
                {log.traceId && (
                  <span className="term-trace">[{log.traceId}]</span>
                )}
                <span className="term-msg">{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Emit New Log Modal */}
      {showEmitModal && (
        <div className="modal-overlay" onClick={() => setShowEmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Emit New Distributed Log</h2>
                <p>POST /logs to Log Service on Port 8086</p>
              </div>
              <button className="btn-close" onClick={() => setShowEmitModal(false)}>✕</button>
            </div>

            <form onSubmit={handleEmitLog}>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label>Originating Service</label>
                  <select
                    className="select-input full-width"
                    value={newLogService}
                    onChange={(e) => setNewLogService(e.target.value)}
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.name}>
                        {svc.name} (Port {svc.port})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Log Severity Level</label>
                  <select
                    className="select-input full-width"
                    value={newLogLevel}
                    onChange={(e) => setNewLogLevel(e.target.value)}
                  >
                    <option value="INFO">INFO (Normal operational event)</option>
                    <option value="WARN">WARN (Warning or high latency detected)</option>
                    <option value="ERROR">ERROR (Fault, exception, or failure)</option>
                    <option value="DEBUG">DEBUG (Detailed diagnostic context)</option>
                  </select>
                </div>

                <div className="form-group full-span">
                  <label>Log Message Content</label>
                  <textarea
                    className="textarea-input"
                    rows={4}
                    placeholder="e.g. Order #104 payment verification initiated via Payment Service"
                    value={newLogMessage}
                    onChange={(e) => setNewLogMessage(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !newLogMessage.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Send to Log Service (POST)"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEmitModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
