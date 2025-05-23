import FunctionConfig from '../models/FunctionConfig';
import MiscConfig from '../models/MiscConfig';
import UserConfig from '../models/UserConfig';
import LastUpdateConfig from '../models/LastUpdateConfig';

class ConfigFactory {
  static createAllConfigs(states, setters) {
    return {
      functionConfig: new FunctionConfig(
        states.functionConfig || {}, 
        setters.setFunctionConfig
      ),
      
      miscConfig: new MiscConfig(
        states.miscConfig || {}, 
        setters.setMiscConfig
      ),
      
      userConfig: new UserConfig(),
      
      lastUpdate: new LastUpdateConfig(
        states.lastUpdate || {}, 
        setters.setLastUpdate
      )
    };
  }
}

export default ConfigFactory;