import { TimeText } from "..";
import { useConfig } from "../../container/ConfigProvider";

const ConfigTimeText = ({ 
    configKey,
    defaultText = "Not updated",
    ...rest
}) => {
    const { lastUpdate } = useConfig();

    return (
        <TimeText
            time={lastUpdate[configKey]}
            defaultText={defaultText}
            fontWeight={"medium"}
            {...rest}
        />
    );
}

export default ConfigTimeText;