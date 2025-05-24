import ConfigManager from '../ConfigManager'
import BaseConfig from './BaseConfig';

class UserConfig extends BaseConfig {
  constructor() {
    // No state setter because we don't store user config in state
    super('userConfig', {}, null);
  }

  // Override to exclude state updates
  async setConfig(config) {
    try {
      await ConfigManager.setConfig(this.configKey, config);
      return true;
    } catch (error) {
      console.error(`Error updating ${this.configKey}:`, error);
      return false;
    }
  }
}

export default UserConfig;