import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsView({ telemetrySeries, services, healthMap }) {
  const [timeRange, setTimeRange] = useState("15m");

  // Status code distribution data
  const statusCodes = [
    { name: "200 OK", value: 875, color: "#10b981" },
    { name: "201 Created", value: 140, color: "#34d399" },
    { name: "400 Bad Request", value: 24, color: "#f59e0b" },
    { name: "404 Not Found", value: 18, color: "#fb923c" },
    { name: "500 Internal Error", value: 6, color: "#ef4444" },
  ];

  // Memory usage by service
  const memoryData = [
    { name: "API Gateway", usedMB: 168, maxMB: 512 },
    { name: "Order Service", usedMB: 194, maxMB: 512 },
    { name: "Payment Service", usedMB: 145, maxMB: 512 },
    { name: "Log Service", usedMB: 122, maxMB: 512 },
    { name: "Eureka Server", usedMB: 110, maxMB: 512 },
  ];

  return (
    <div className="view-container">
      {/* Analytics Toolbar */}
      <div className="panel analytics-toolbar">
        <div>
          <h2>Performance & Cluster Telemetry</h2>
          <p>Historical trends captured via Actuator & Gateway metrics</p>
        </div>
        <div className="time-range-buttons">
          {["5m", "15m", "1h", "24h"].map((range) => (
            <button
              key={range}
              className={`pill-btn ${timeRange === range ? "active" : ""}`}
              onClick={() => setTimeRange(range)}
            >
              Last {range}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Metric Highlights */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">P99 LATENCY</span>
          <div className="kpi-value text-green">64 ms</div>
          <span className="kpi-sub">Within SLA target (&lt; 150ms)</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">PEAK THROUGHPUT</span>
          <div className="kpi-value blue">198 req/s</div>
          <span className="kpi-sub">Gateway edge traffic</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">SUCCESS RATE</span>
          <div className="kpi-value green">99.42%</div>
          <span className="kpi-sub">Across all API calls</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">JVM HEAP ALLOCATION</span>
          <div className="kpi-value">739 / 2,560 MB</div>
          <span className="kpi-sub">28.8% aggregate utilization</span>
        </div>
      </div>

      {/* Row 1: Latency Trends LineChart & Traffic AreaChart */}
      <div className="overview-two-col">
        {/* Latency by Service */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Round-Trip Latency By Service</h2>
              <p>Per-service response latency profile (ms)</p>
            </div>
          </div>
          <div className="chart-container" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetrySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gatewayLatency"
                  name="API Gateway"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="orderLatency"
                  name="Order Service"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="paymentLatency"
                  name="Payment Service"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="logLatency"
                  name="Log Service"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Throughput AreaChart */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Gateway Request Throughput</h2>
              <p>Total ingress requests handled per second</p>
            </div>
          </div>
          <div className="chart-container" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetrySeries}>
                <defs>
                  <linearGradient id="reqColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} unit=" req/s" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requestsPerSec"
                  name="Requests / sec"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#reqColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: JVM Memory BarChart & Status Code Donut Chart */}
      <div className="overview-two-col">
        {/* JVM Memory */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>JVM Memory Allocation</h2>
              <p>Heap memory in use vs configured maximum (MB)</p>
            </div>
          </div>
          <div className="chart-container" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} unit="MB" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="usedMB" name="Used Heap (MB)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxMB" name="Max Heap (MB)" fill="#374151" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HTTP Status Code Distribution */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>HTTP Response Codes</h2>
              <p>Breakdown of response codes returned across all routes</p>
            </div>
          </div>
          <div className="donut-chart-row">
            <div style={{ width: "50%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCodes}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusCodes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#3f3f46",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="status-code-legend">
              {statusCodes.map((item) => (
                <div key={item.name} className="donut-legend-item">
                  <span className="dot" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-label">{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
