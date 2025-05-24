import ConfigManager from '../ConfigManager'

class BaseConfig {
  // Static map to track active listeners by configKey
  static activeListeners = new Map();

  constructor(configKey, initialState = {}, stateSetter = null) {
    this.configKey = configKey;
    this.state = initialState;
    this.stateSetter = stateSetter;
    this.handlerId = null;
    
    // Setup event listener for config-updated events
    this.setupEventListener();
  }

  setupEventListener() {
    // Check if a listener for this configKey already exists
    if (BaseConfig.activeListeners.has(this.configKey)) {
      const existingHandler = BaseConfig.activeListeners.get(this.configKey);
      existingHandler.instances.push(this);
      this.handlerId = existingHandler.instances.length - 1;
      return;
    }

    
    // Create new handler for this configKey
    const handleConfigUpdate = (event) => {
      // Check if this is a config-updated event for our key
      const detail = event.detail || (event.data || {});
      if (detail.key === this.configKey && 
          !detail.tabSender) {
        
        const { config } = detail;
        // Update all instances that use this key
        const handler = BaseConfig.activeListeners.get(this.configKey);
        if (handler) {
          handler.instances.forEach(instance => {
            instance.updateState(config);
          });
        }
      }
    };
    
    // Store the handler info
    const handlerInfo = {
      handler: handleConfigUpdate,
      instances: [this]
    };
    
    BaseConfig.activeListeners.set(this.configKey, handlerInfo);
    this.handlerId = 0;
    
    // Listen for both custom 'config-updated' events and window message events
    window.addEventListener('config-updated', handleConfigUpdate);
  }

  // Basic setter for the entire config
  async setConfig(config) {
    try {
      await ConfigManager.setConfig(this.configKey, config);
      if (this.stateSetter) {
        this.stateSetter(prev => ({ ...prev, ...config }));
      }
      return true;
    } catch (error) {
      console.error(`Error updating ${this.configKey}:`, error);
      return false;
    }
  }

  // Basic getter for the entire config or specific keys
  async getConfig(subKeys = null) {
    try {
      if (!subKeys) return this.state;
      return await ConfigManager.getConfig(this.configKey, subKeys);
    } catch (error) {
      console.error(`Error getting ${this.configKey}:`, error);
      return subKeys ? {} : this.state;
    }
  }

  // Update the state reference without saving to storage
  updateState(newState) {
    this.state = { ...this.state, ...newState };
    if (this.stateSetter) {
      this.stateSetter(this.state);
    }
  }
  
  // Cleanup method to be called when the component unmounts
  cleanup() {
    // Remove this instance from the handler's instance list
    if (BaseConfig.activeListeners.has(this.configKey) && this.handlerId !== null) {
      const handlerInfo = BaseConfig.activeListeners.get(this.configKey);
      handlerInfo.instances.splice(this.handlerId, 1);
      
      // If no more instances use this handler, remove the event listener
      if (handlerInfo.instances.length === 0) {
        window.removeEventListener('config-updated', handlerInfo.handler);
        BaseConfig.activeListeners.delete(this.configKey);
      }
    }
  }
}

export default BaseConfig;