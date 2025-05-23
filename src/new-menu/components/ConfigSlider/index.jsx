import { useConfig } from "../../container/ConfigProvider";
import { Slider } from "..";

const ConfigSlider = ({
    configKey,
    dataKey,
    ...restProps
}) => {
    const { miscConfig, setMiscConfigGroup } = useConfig();
    const handleChangeEnd = (value) => {
        try {
            setMiscConfigGroup(configKey, {[dataKey]: value});
        }
        catch (error) {
            console.error("Error updating config(Slider):", error);
        }
    };

    return (
        <Slider
            value={miscConfig[configKey]?.[dataKey]}
            onChangeEnd={handleChangeEnd}
            {...restProps}
        />
    );
};

export default ConfigSlider;