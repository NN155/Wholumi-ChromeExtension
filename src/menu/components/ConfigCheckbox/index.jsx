import { useConfig } from "../../container/ConfigProvider";
import { Checkbox } from "..";

const ConfigCheckbox = ({ 
  configKey, 
  label, 
  defaultChecked = false,
  onChange,
  ...restProps 
}) => {
  const { functionConfig, setFunctionConfigItem } = useConfig();
  
  const isChecked = configKey in functionConfig 
    ? functionConfig[configKey] 
    : defaultChecked;
  
  const handleChange = (e) => {
    setFunctionConfigItem(configKey, e.target.checked);    
    if (onChange) {
      onChange(e);
    }
  };
  
  return (
    <Checkbox
      label={label}
      checked={isChecked}
      onChange={handleChange}
      {...restProps}
    />
  );
};

export default ConfigCheckbox;