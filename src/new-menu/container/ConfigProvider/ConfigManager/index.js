class ConfigManager {
  static isExtension = (
    typeof ExtensionConfig !== 'undefined' &&
    typeof ExtensionConfig.getConfig === 'function' &&
    typeof ExtensionConfig.setConfig === 'function'
  );

  static async getConfig(key, subKeys = null) {
    try {
      let config = {};

      if (this.isExtension) {

        config = await ExtensionConfig.getConfig(key, subKeys) || {};
      } else {
        const storedValue = localStorage.getItem(`config_${key}`);
        config = storedValue ? JSON.parse(storedValue) : {};

        if (subKeys) {
          if (typeof subKeys === 'string') {
            return { [subKeys]: config[subKeys] };
          }

          if (Array.isArray(subKeys)) {
            const result = {};
            subKeys.forEach(subKey => {
              if (config.hasOwnProperty(subKey)) {
                result[subKey] = config[subKey];
              }
            });
            return result;
          }
        }
      }

      return config;
    } catch (error) {
      console.error(`Error getting ${key} config:`, error);
      return {};
    }
  }

  static async setConfig(key, config) {
    try {
      if (this.isExtension) {
        await ExtensionConfig.setConfig(key, config);
      } else {
        let updatedConfig = await this.getConfig(key);
        updatedConfig = {
          ...updatedConfig,
          ...config
        };
        localStorage.setItem(`config_${key}`, JSON.stringify(updatedConfig));
      }

      return true;
    } catch (error) {
      console.error(`Error setting ${key} config:`, error);
      return false;
    }
  }
}

export default ConfigManager;