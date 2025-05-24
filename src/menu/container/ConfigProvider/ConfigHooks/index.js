import { useCallback, useMemo } from "react";
import ConfigFactory from "../ConfigFactory";

const ConfigHooks = ({ 
  functionConfig, setFunctionConfig, 
  miscConfig, setMiscConfig, 
  lastUpdate, setLastUpdate 
}) => {
  
  const configModels = useMemo(() => ConfigFactory.createAllConfigs(
    { functionConfig, miscConfig, lastUpdate },
    { setFunctionConfig, setMiscConfig, setLastUpdate }
  ), [functionConfig, miscConfig, lastUpdate]);
  
  // ======= FUNCTIONS FOR functionConfig =======
  
  const setFunctionConfigItem = useCallback(async (key, value) => {
    return configModels.functionConfig.setItem(key, value);
  }, [configModels.functionConfig]);

  const updateFunctionConfig = useCallback(async (config) => {
    return configModels.functionConfig.setConfig(config);
  }, [configModels.functionConfig]);

  const getFunctionConfigValue = useCallback(async (subKeys = null) => {
    return configModels.functionConfig.getConfig(subKeys);
  }, [configModels.functionConfig]);

  // ======= FUNCTIONS FOR miscConfig =======

  const setMiscConfigGroup = useCallback(async (group, values) => {
    return configModels.miscConfig.setGroup(group, values);
  }, [configModels.miscConfig]);

  const updateMiscConfig = useCallback(async (config) => {
    return configModels.miscConfig.setConfig(config);
  }, [configModels.miscConfig]);

  const getMiscConfigValue = useCallback(async (group = null, param = null) => {
    return configModels.miscConfig.getValue(group, param);
  }, [configModels.miscConfig]);

  // ======= FUNCTIONS FOR userConfig =======

  const setUserConfig = useCallback(async (config) => {
    return configModels.userConfig.setConfig(config);
  }, [configModels.userConfig]);

  // ======= FUNCTIONS FOR lastUpdate =======

  const getLastUpdateValue = useCallback((key = null) => {
    return configModels.lastUpdate.getValue(key);
  }, [configModels.lastUpdate]);

  const updateLastUpdateState = useCallback((updates) => {
    configModels.lastUpdate.updateTimestamps(updates);
  }, [configModels.lastUpdate]);

  // Return all hooks
  return {
    // Functions for functionConfig
    setFunctionConfigItem,
    updateFunctionConfig,
    getFunctionConfigValue,

    // Functions for miscConfig
    setMiscConfigGroup,
    updateMiscConfig,
    getMiscConfigValue,

    // Functions for userConfig
    setUserConfig,

    // Functions for lastUpdate
    getLastUpdateValue,
    updateLastUpdateState
  };
};

export default ConfigHooks;