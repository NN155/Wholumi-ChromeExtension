import { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import ConfigManager from "./ConfigManager";
import ConfigHooks from "./ConfigHooks";

// Create context
export const ConfigContext = createContext();

// Hook for using the config context
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return context;
};

const ConfigProvider = ({ children }) => {
  // States for different config types
  const [functionConfig, setFunctionConfig] = useState({});
  const [miscConfig, setMiscConfig] = useState({});
  const [lastUpdate, setLastUpdate] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Memoized update functions
  const updateFunctionConfig = useCallback((config) => {
    setFunctionConfig(prev => ({ ...prev, ...config }));
  }, []);

  const updateMiscConfig = useCallback((config) => {
    setMiscConfig(prev => {
      const result = { ...prev };
      Object.keys(config).forEach(group => {
        result[group] = { ...(result[group] || {}), ...config[group] };
      });
      return result;
    });
  }, []);

  const updateLastUpdate = useCallback((config) => {
    setLastUpdate(prev => ({ ...prev, ...config }));
  }, []);

  // Load initial configs
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // Load all configurations
        const functionCfg = await ConfigManager.getConfig("functionConfig") || {};
        const miscCfg = await ConfigManager.getConfig("miscConfig") || {};
        const lastUpdateCfg = await ConfigManager.getConfig("lastUpdate") || {};

        // Update states
        setFunctionConfig(functionCfg);
        setMiscConfig(miscCfg);
        setLastUpdate(lastUpdateCfg);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading configurations:", error);
        setIsLoaded(true);
      }
    };

    loadConfigs();
    
    // Set up event listeners for external config updates
    const handleExtensionConfigUpdate = (event) => {
      const { key, config } = event.detail || {};
      
      switch (key) {
        case "functionConfig":
          updateFunctionConfig(config);
          break;
        case "miscConfig":
          updateMiscConfig(config);
          break;
        case "lastUpdate":
          updateLastUpdate(config);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('config-updated', handleExtensionConfigUpdate);
    return () => {
      window.removeEventListener('config-updated', handleExtensionConfigUpdate);
    };
  }, [updateFunctionConfig, updateMiscConfig, updateLastUpdate]);

  const hooks = useMemo(() => ConfigHooks({
    functionConfig, setFunctionConfig,
    miscConfig, setMiscConfig,
    lastUpdate, setLastUpdate
  }), [functionConfig, miscConfig, lastUpdate]);

  // Create context value with all states and functions - memoized to prevent recreation
  const contextValue = useMemo(() => ({
    functionConfig,
    miscConfig,
    lastUpdate,
    isLoaded,
    ...hooks
  }), [functionConfig, miscConfig, lastUpdate, isLoaded, hooks]);

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;