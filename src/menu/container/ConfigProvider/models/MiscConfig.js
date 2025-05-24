import ConfigManager from '../ConfigManager'
import BaseConfig from './BaseConfig';

class MiscConfig extends BaseConfig {
  constructor(initialState = {}, stateSetter = null) {
    super('miscConfig', initialState, stateSetter);
  }

  // Get a group or specific param from miscConfig
  async getValue(group = null, param = null) {
    try {
      if (!group) return this.state;
      
      if (param) {
        return this.state[group] ? this.state[group][param] : undefined;
      } else {
        return this.state[group] || {};
      }
    } catch (error) {
      console.error(`Error getting ${this.configKey}[${group}]:`, error);
      return param ? undefined : {};
    }
  }

  // Update a specific group in miscConfig
  async setGroup(group, values) {
    try {
      const update = { [group]: { ...this.state[group], ...values } };
      await ConfigManager.setConfig(this.configKey, update);
      if (this.stateSetter) {
        this.stateSetter(prev => ({ 
          ...prev, 
          [group]: { ...prev[group], ...values } 
        }));
      }
      return true;
    } catch (error) {
      console.error(`Error updating ${this.configKey}[${group}]:`, error);
      return false;
    }
  }

  // Override base setConfig to handle nested group structure
  async setConfig(config) {
    try {
      await window.ConfigManager.setConfig(this.configKey, config);
      if (this.stateSetter) {
        this.stateSetter(prev => {
          const result = { ...prev };
          Object.keys(config).forEach(group => {
            result[group] = { ...(result[group] || {}), ...config[group] };
          });
          return result;
        });
      }
      return true;
    } catch (error) {
      console.error(`Error updating ${this.configKey}:`, error);
      return false;
    }
  }
}

export default MiscConfig;