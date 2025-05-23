import ConfigManager from '../ConfigManager'
import BaseConfig from './BaseConfig';


class FunctionConfig extends BaseConfig {
  constructor(initialState = {}, stateSetter = null) {
    super('functionConfig', initialState, stateSetter);
  }

  // Set a single function config item
  async setItem(key, value) {
    try {
      const update = { [key]: value };
      await ConfigManager.setConfig(this.configKey, update);
      if (this.stateSetter) {
        this.stateSetter(prev => ({ ...prev, ...update }));
      }
      return true;
    } catch (error) {
      console.error(`Error updating ${this.configKey}[${key}]:`, error);
      return false;
    }
  }

  // Toggle a boolean function config item
  async toggleItem(key) {
    const currentValue = this.state[key] || false;
    return this.setItem(key, !currentValue);
  }
}

export default FunctionConfig;