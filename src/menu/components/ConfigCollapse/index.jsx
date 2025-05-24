import { useConfig } from "../../container/ConfigProvider";
import { Collapse } from "@chakra-ui/react";
import { useMemo } from "react";

const ConfigCollapse = ({
  configKey,
  condition,
  ...restProps
}) => {
  const { functionConfig, miscConfig, lastUpdate } = useConfig();

  const isVisible = useMemo(() => {
    if (condition !== undefined) {
      if (typeof condition === "function") {
        return condition(functionConfig, miscConfig, lastUpdate);
      } else {
        return !!condition;
      }
    } 
    return !!functionConfig[configKey];
  }, [condition, functionConfig, miscConfig, lastUpdate, configKey]);

  return (
    <Collapse
      in={isVisible}
      {...restProps}
    />
  );
};

export default ConfigCollapse;