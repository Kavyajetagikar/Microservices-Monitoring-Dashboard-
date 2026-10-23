import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import OverviewView from "./components/OverviewView";
import ServiceHealthView from "./components/ServiceHealthView";
import TopologyView from "./components/TopologyView";
import LogsView from "./components/LogsView";
import AnalyticsView from "./components/AnalyticsView";
import ApiPlaygroundView from "./components/ApiPlaygroundView";
import ChaosModal from "./components/ChaosModal";

import {
  DEFAULT_SERVICES,
  INITIAL_LOGS,
  GENERATE_TIME_SERIES,
} from "./data/mockData";
import {
  checkAllServices,
  checkServiceHealth,
  fetchLogsFromBackend,
} from "./services/api";

import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [services] = useState(DEFAULT_SERVICES);
  const [healthMap, setHealthMap] = useState({});
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to interactive demo so UI is instantly vibrant
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5s auto-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [telemetrySeries, setTelemetrySeries] = useState(GENERATE_TIME_SERIES());
  const [chaosOverrides, setChaosOverrides] = useState({});
  const [isChaosOpen, setIsChaosOpen] = useState(false);

  // Poll service health and update telemetry
  const pollAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const results = await checkAllServices(services, isDemoMode, chaosOverrides);
      setHealthMap(results);
      setLastUpdated(new Date().toLocaleTimeString());

      // Update telemetry rolling series
      setTelemetrySeries((prev) => {
        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const newPoint = {
          time: timeLabel,
          gatewayLatency: results["api-gateway"]?.latency || Math.floor(18 + Math.random() * 10),
          orderLatency: results["order-service"]?.latency || Math.floor(32 + Math.random() * 20),
          paymentLatency: results["payment-service"]?.latency || Math.floor(40 + Math.random() * 25),
          logLatency: results["log-service"]?.latency || Math.floor(14 + Math.random() * 12),
          eurekaLatency: results["eureka-server"]?.latency || Math.floor(8 + Math.random() * 6),
          requestsPerSec: Math.floor(110 + Math.random() * 70),
          jvmHeapUsedMB: Math.floor(185 + Math.random() * 30),
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });

      // Poll logs from log-service
      const logsResult = await fetchLogsFromBackend(null, null, isDemoMode);
      if (logsResult.isLive && Array.isArray(logsResult.logs) && logsResult.logs.length > 0) {
        setLogs(logsResult.logs);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsRefreshing(false);
    }
  }, [services, isDemoMode, chaosOverrides]);

  // Initial load and periodic timer
  useEffect(() => {
    pollAll();
  }, [pollAll]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const timer = setInterval(() => {
      pollAll();
    }, refreshInterval);
    return () => clearInterval(timer);
  }, [pollAll, refreshInterval]);

  // Ping a single service directly
  const handlePingSingle = async (service) => {
    const singleResult = await checkServiceHealth(service, isDemoMode, chaosOverrides);
    setHealthMap((prev) => ({
      ...prev,
      [service.id]: singleResult,
    }));
  };

  const handleResetChaos = () => {
    setChaosOverrides({});
    pollAll();
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        services={services}
        healthMap={healthMap}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        logsCount={logs.length}
        openChaosModal={() => setIsChaosOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Topbar
          activeTab={activeTab}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          onRefreshNow={pollAll}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          healthMap={healthMap}
          isDemoMode={isDemoMode}
          setIsDemoMode={setIsDemoMode}
          openChaosModal={() => setIsChaosOpen(true)}
        />

        <main className="content-area">
          {activeTab === "overview" && (
            <OverviewView
              services={services}
              healthMap={healthMap}
              telemetrySeries={telemetrySeries}
              recentLogs={logs}
              setActiveTab={setActiveTab}
              onPingService={handlePingSingle}
              isDemoMode={isDemoMode}
              setIsDemoMode={setIsDemoMode}
              openChaosModal={() => setIsChaosOpen(true)}
            />
          )}

          {activeTab === "health" && (
            <ServiceHealthView
              services={services}
              healthMap={healthMap}
              onPingService={handlePingSingle}
            />
          )}

          {activeTab === "topology" && (
            <TopologyView
              services={services}
              healthMap={healthMap}
              onPingService={handlePingSingle}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "logs" && (
            <LogsView
              logs={logs}
              setLogs={setLogs}
              services={services}
              isDemoMode={isDemoMode}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView
              telemetrySeries={telemetrySeries}
              services={services}
              healthMap={healthMap}
            />
          )}

          {activeTab === "playground" && (
            <ApiPlaygroundView isDemoMode={isDemoMode} />
          )}
        </main>
      </div>

      {/* Chaos & Fault Simulator Modal */}
      <ChaosModal
        isOpen={isChaosOpen}
        onClose={() => setIsChaosOpen(false)}
        services={services}
        chaosOverrides={chaosOverrides}
        setChaosOverrides={setChaosOverrides}
        onApplyChaos={pollAll}
        onResetChaos={handleResetChaos}
      />
    </div>
  );
}

export default App;
