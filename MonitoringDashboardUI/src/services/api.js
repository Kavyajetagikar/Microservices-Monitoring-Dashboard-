import { DEFAULT_SERVICES, MOCK_JVM_METRICS } from "../data/mockData";

// Timeout wrapper for fetch requests
async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Checks health of a specific microservice.
 * Attempts Vite proxy first, falls back to direct URL, or fallback simulated data in Demo Mode.
 */
export async function checkServiceHealth(service, isDemoMode = false, chaosOverrides = {}) {
  // If chaos testing forced an override:
  if (chaosOverrides[service.id]) {
    const override = chaosOverrides[service.id];
    return {
      id: service.id,
      name: service.name,
      port: service.port,
      status: override.status,
      latency: override.latency ?? Math.floor(Math.random() * 20 + 20),
      timestamp: new Date().toLocaleTimeString(),
      details: {
        status: override.status,
        components: {
          diskSpace: { status: override.status === "DOWN" ? "DOWN" : "UP" },
          ping: { status: override.status },
        },
      },
      isSimulated: true,
      error: override.status === "DOWN" ? "Fault Injection: Service forcefully stopped" : null,
    };
  }

  const start = performance.now();
  const endpoint = service.healthEndpoint;

  // URLs to try: Proxied path first, then direct URL
  const urlsToTry = [
    `${service.proxyPath}${endpoint}`,
    `${service.directUrl}${endpoint}`,
  ];

  for (const url of urlsToTry) {
    try {
      const response = await fetchWithTimeout(url);
      const elapsed = Math.round(performance.now() - start);

      if (response.ok) {
        let data = {};
        try {
          data = await response.json();
        } catch {
          data = { status: "UP", raw: "Non-JSON response" };
        }

        const isUp = data.status === "UP" || response.status === 200;
        return {
          id: service.id,
          name: service.name,
          port: service.port,
          status: isUp ? "UP" : "DEGRADED",
          latency: elapsed,
          timestamp: new Date().toLocaleTimeString(),
          details: data,
          isSimulated: false,
        };
      }
    } catch {
      // Continue to next URL attempt
    }
  }

  // If live connection failed:
  if (isDemoMode) {
    const elapsed = Math.floor(Math.random() * 35) + 12;
    return {
      id: service.id,
      name: service.name,
      port: service.port,
      status: "UP",
      latency: elapsed,
      timestamp: new Date().toLocaleTimeString(),
      details: {
        status: "UP",
        components: {
          diskSpace: { status: "UP", details: { free: 42949672960, threshold: 10485760 } },
          ping: { status: "UP" },
          discoveryClient: { status: "UP", details: { eureka: "connected" } },
        },
      },
      isSimulated: true,
    };
  }

  return {
    id: service.id,
    name: service.name,
    port: service.port,
    status: "UNAVAILABLE",
    latency: null,
    timestamp: new Date().toLocaleTimeString(),
    details: null,
    isSimulated: false,
    error: `Unable to connect to port ${service.port}. Start the service or toggle Demo Mode.`,
  };
}

/**
 * Checks health of all registered services concurrently.
 */
export async function checkAllServices(services = DEFAULT_SERVICES, isDemoMode = false, chaosOverrides = {}) {
  const results = await Promise.all(
    services.map((svc) => checkServiceHealth(svc, isDemoMode, chaosOverrides))
  );
  return Object.fromEntries(results.map((r) => [r.id, r]));
}

/**
 * Fetches centralized logs from Log Service (port 8086).
 */
export async function fetchLogsFromBackend(level = null, serviceName = null, isDemoMode = false, localLogs = []) {
  const params = new URLSearchParams();
  if (level && level !== "ALL") params.append("level", level);
  if (serviceName && serviceName !== "ALL") params.append("service", serviceName);

  const query = params.toString() ? `?${params.toString()}` : "";
  const urls = [
    `/proxy/log/logs${query}`,
    `http://localhost:8086/logs${query}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, {}, 2000);
      if (response.ok) {
        const data = await response.json();
        return { logs: data, isLive: true };
      }
    } catch {
      // Fallback below
    }
  }

  // Offline / Demo fallback
  let filtered = [...localLogs];
  if (level && level !== "ALL") {
    filtered = filtered.filter((l) => l.level?.toUpperCase() === level.toUpperCase());
  }
  if (serviceName && serviceName !== "ALL") {
    filtered = filtered.filter((l) => l.service?.toLowerCase().includes(serviceName.toLowerCase()));
  }

  return { logs: filtered, isLive: false };
}

/**
 * Sends a new log entry to Log Service (POST /logs).
 */
export async function submitLogToBackend(logPayload, isDemoMode = false) {
  const urls = [
    `/proxy/log/logs`,
    `http://localhost:8086/logs`,
  ];

  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logPayload),
      }, 2000);

      if (res.ok) {
        const data = await res.json();
        return { success: true, log: data, isLive: true };
      }
    } catch {
      // Continue to next fallback
    }
  }

  // Simulated creation
  const created = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    level: logPayload.level || "INFO",
    service: logPayload.service || "Generic Service",
    message: logPayload.message || "Custom event emitted",
    traceId: `tr-${Math.floor(10000 + Math.random() * 90000)}`,
  };

  return { success: true, log: created, isLive: false };
}

/**
 * Executes an interactive request in the API Playground.
 */
export async function executeApiTest(method, url, body = null) {
  const start = performance.now();
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body && (method === "POST" || method === "PUT")) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const response = await fetchWithTimeout(url, options, 4000);
    const latency = Math.round(performance.now() - start);

    let data;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      latency,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (err) {
    const latency = Math.round(performance.now() - start);
    return {
      success: false,
      status: 0,
      statusText: "Connection Failed / Offline",
      latency,
      data: { error: err.message, hint: "Make sure the targeted microservice is running or use a proxied route." },
      headers: {},
    };
  }
}
