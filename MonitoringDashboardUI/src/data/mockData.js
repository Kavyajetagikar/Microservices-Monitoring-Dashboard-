// Default Microservice definitions matching the Spring Boot application configuration
export const DEFAULT_SERVICES = [
  {
    id: "api-gateway",
    name: "API Gateway",
    code: "GATEWAY",
    port: 8080,
    role: "Reverse Proxy & Cloud Gateway",
    directUrl: "http://localhost:8080",
    proxyPath: "/proxy/gateway",
    healthEndpoint: "/actuator/health",
    metricsEndpoint: "/actuator/metrics",
    infoEndpoint: "/actuator/info",
    color: "#6366f1",
    accent: "indigo",
    tech: "Spring Cloud Gateway",
    routes: ["/api/orders/** -> ORDER-SERVICE"],
    sampleEndpoints: [
      { name: "Health Actuator", path: "/actuator/health", method: "GET" },
      { name: "Proxied Orders", path: "/api/orders", method: "GET" },
      { name: "Actuator Metrics", path: "/actuator/metrics", method: "GET" },
    ],
  },
  {
    id: "eureka-server",
    name: "Eureka Server",
    code: "EUREKA",
    port: 8761,
    role: "Service Registry & Discovery",
    directUrl: "http://localhost:8761",
    proxyPath: "/proxy/eureka",
    healthEndpoint: "/eureka/apps",
    metricsEndpoint: null,
    infoEndpoint: null,
    color: "#f59e0b",
    accent: "amber",
    tech: "Netflix Eureka",
    routes: ["Self-contained Registry"],
    sampleEndpoints: [
      { name: "Eureka Dashboard", path: "/", method: "GET" },
      { name: "Registered Apps (JSON/XML)", path: "/eureka/apps", method: "GET" },
    ],
  },
  {
    id: "order-service",
    name: "Order Service",
    code: "ORDER",
    port: 8081,
    role: "Order Placement & State Management",
    directUrl: "http://localhost:8081",
    proxyPath: "/proxy/order",
    healthEndpoint: "/actuator/health",
    metricsEndpoint: "/actuator/metrics",
    infoEndpoint: "/actuator/info",
    color: "#10b981",
    accent: "emerald",
    tech: "Spring Boot Web, JPA & MySQL",
    routes: ["Registered with Eureka"],
    sampleEndpoints: [
      { name: "Fetch All Orders", path: "/api/orders", method: "GET" },
      { name: "Create Order (POST)", path: "/api/orders", method: "POST", body: { customer: "Omkar", amount: 3200, status: "CONFIRMED" } },
      { name: "Service Status Ping", path: "/api/orders/status", method: "GET" },
      { name: "Health Actuator", path: "/actuator/health", method: "GET" },
      { name: "JVM Metrics", path: "/actuator/metrics/jvm.memory.used", method: "GET" },
    ],
  },
  {
    id: "payment-service",
    name: "Payment Service",
    code: "PAYMENT",
    port: 8082,
    role: "Billing & Transaction Processor",
    directUrl: "http://localhost:8082",
    proxyPath: "/proxy/payment",
    healthEndpoint: "/actuator/health",
    metricsEndpoint: "/actuator/metrics",
    infoEndpoint: "/actuator/info",
    color: "#ec4899",
    accent: "pink",
    tech: "Spring Boot Web & Actuator",
    routes: ["Registered with Eureka"],
    sampleEndpoints: [
      { name: "Payment Health", path: "/payments/health", method: "GET" },
      { name: "Query Order Payment (101)", path: "/payments/101", method: "GET" },
      { name: "Health Actuator", path: "/actuator/health", method: "GET" },
      { name: "Service Info", path: "/actuator/info", method: "GET" },
    ],
  },
  {
    id: "log-service",
    name: "Log Service",
    code: "LOG",
    port: 8086,
    role: "Centralized Distributed Logger",
    directUrl: "http://localhost:8086",
    proxyPath: "/proxy/log",
    healthEndpoint: "/actuator/health",
    metricsEndpoint: "/actuator/metrics",
    infoEndpoint: "/actuator/info",
    color: "#8b5cf6",
    accent: "purple",
    tech: "Spring Boot Web & Actuator",
    routes: ["Registered with Eureka"],
    sampleEndpoints: [
      { name: "Fetch All Logs", path: "/logs", method: "GET" },
      { name: "Filter Error Logs", path: "/logs?level=ERROR", method: "GET" },
      { name: "Filter Order Logs", path: "/logs?service=Order%20Service", method: "GET" },
      { name: "Submit Log", path: "/logs", method: "POST", body: { level: "INFO", service: "Order Service", message: "Processed batch event" } },
    ],
  },
];

// Initial logs mirroring Spring Boot log-service output + enriched historical events
export const INITIAL_LOGS = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
    level: "INFO",
    service: "Eureka Server",
    message: "Eureka Server initialized on port 8761 with peer discovery",
    traceId: "tr-00918",
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
    level: "INFO",
    service: "Order Service",
    message: "Order service started and registered with Eureka [instanceId=order-service:8081]",
    traceId: "tr-00919",
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 240000).toLocaleTimeString(),
    level: "INFO",
    service: "Payment Service",
    message: "Payment service started and listening on port 8082",
    traceId: "tr-00920",
  },
  {
    id: "log-4",
    timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
    level: "WARN",
    service: "Order Service",
    message: "Demo warning: order processing took longer than expected (320ms)",
    traceId: "tr-00921",
  },
  {
    id: "log-5",
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
    level: "INFO",
    service: "API Gateway",
    message: "Route mapped: /api/orders/** mapped to lb://ORDER-SERVICE",
    traceId: "tr-00922",
  },
  {
    id: "log-6",
    timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
    level: "INFO",
    service: "Payment Service",
    message: "Payment transaction completed successfully for order #101 [status=CONFIRMED]",
    traceId: "tr-00923",
  },
  {
    id: "log-7",
    timestamp: new Date(Date.now() - 20000).toLocaleTimeString(),
    level: "INFO",
    service: "Log Service",
    message: "Log aggregator buffer flushed (24 records stored in memory)",
    traceId: "tr-00924",
  },
];

// Historical metrics time-series (15 intervals) for Recharts analytics
export const GENERATE_TIME_SERIES = () => {
  const points = [];
  const now = Date.now();
  for (let i = 14; i >= 0; i--) {
    const t = new Date(now - i * 30000);
    const timeLabel = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    points.push({
      time: timeLabel,
      gatewayLatency: Math.floor(18 + Math.random() * 12),
      orderLatency: Math.floor(35 + Math.random() * 25),
      paymentLatency: Math.floor(45 + Math.random() * 30),
      logLatency: Math.floor(15 + Math.random() * 10),
      eurekaLatency: Math.floor(8 + Math.random() * 6),
      requestsPerSec: Math.floor(120 + Math.random() * 80),
      jvmHeapUsedMB: Math.floor(180 + Math.random() * 35),
    });
  }
  return points;
};

// Architecture Topology Nodes & Connections
export const TOPOLOGY_DATA = {
  nodes: [
    { id: "client", label: "Client Apps / SPA", type: "client", x: 60, y: 180, icon: "💻", badge: "EXTERNAL" },
    { id: "gateway", label: "API Gateway", type: "gateway", port: 8080, x: 260, y: 180, icon: "🛡️", badge: "PORT 8080" },
    { id: "eureka", label: "Eureka Registry", type: "registry", port: 8761, x: 260, y: 30, icon: "🔭", badge: "PORT 8761" },
    { id: "order", label: "Order Service", type: "service", port: 8081, x: 500, y: 80, icon: "📦", badge: "PORT 8081" },
    { id: "payment", label: "Payment Service", type: "service", port: 8082, x: 500, y: 190, icon: "💳", badge: "PORT 8082" },
    { id: "log", label: "Log Service", type: "service", port: 8086, x: 500, y: 300, icon: "📜", badge: "PORT 8086" },
  ],
  links: [
    { from: "client", to: "gateway", label: "HTTP / REST", animated: true },
    { from: "gateway", to: "eureka", label: "Service Lookup", dashed: true },
    { from: "gateway", to: "order", label: "/api/orders/**", animated: true },
    { from: "order", to: "payment", label: "Inter-service (RPC)", animated: false },
    { from: "order", to: "log", label: "Audit Events", animated: true },
    { from: "payment", to: "log", label: "Billing Logs", animated: true },
    { from: "order", to: "eureka", label: "Heartbeat", dashed: true },
    { from: "payment", to: "eureka", label: "Heartbeat", dashed: true },
    { from: "log", to: "eureka", label: "Heartbeat", dashed: true },
  ],
};

// Initial simulated JVM and System telemetry
export const MOCK_JVM_METRICS = {
  "jvm.memory.used": 194.5, // MB
  "jvm.memory.max": 512.0,  // MB
  "jvm.threads.live": 28,
  "process.cpu.usage": 4.2, // %
  "system.cpu.count": 8,
  "uptime.seconds": 4328,
};
