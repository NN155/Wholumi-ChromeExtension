import ConfigManager from '../ConfigManager'

class BaseConfig {
  constructor(configKey, initialState = {}, stateSetter = null) {
    this.configKey = configKey;
    this.state = initialState;
    this.stateSetter = stateSetter;
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
}

export default BaseConfig;