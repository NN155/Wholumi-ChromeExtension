import { useConfig } from "../../container/ConfigProvider";
import { Input } from "..";
import { useState, useEffect } from "react";

const ConfigInput = ({
    configKey,
    dataKey,
    ...restProps
}) => {
    const { miscConfig, setMiscConfigGroup } = useConfig();

    const [value, setValue] = useState(miscConfig[configKey]?.[dataKey] || "");

    useEffect(() => {
        const configValue = miscConfig[configKey]?.[dataKey];
        if (configValue !== undefined && configValue !== value) {
            setValue(configValue);
        }
    }, [miscConfig, configKey, dataKey]);


    const handleChangeEnd = (value) => {
        try {
            setMiscConfigGroup(configKey, {[dataKey]: value});
        }
        catch (error) {
            console.error("Error updating config(Input):", error);
        }
    };

    return (
        <Input
            value={value}
            onChangeEnd={handleChangeEnd}
            onChange={(e) => setValue(e.target.value)}
            {...restProps}
        />
    );
};

export default ConfigInput;