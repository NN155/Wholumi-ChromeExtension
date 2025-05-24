import BaseConfig from './BaseConfig';

class LastUpdateConfig extends BaseConfig {
  constructor(initialState = {}, stateSetter = null) {
    super('lastUpdate', initialState, stateSetter);
  }

  // Get a specific update timestamp or all
  getValue(key = null) {
    if (key) {
      return this.state[key];
    }
    return this.state;
  }

  // Update timestamps locally without saving to storage
  updateTimestamps(updates) {
    if (this.stateSetter) {
      this.stateSetter(prev => ({ ...prev, ...updates }));
    }
  }
}

export default LastUpdateConfig;