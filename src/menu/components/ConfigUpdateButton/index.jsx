import { EventButton, ConfigTimeText } from "..";
import { Box, Text } from "@chakra-ui/react";

const ConfigUpdateButton = ({ 
    label, 
    event="update-data-config",
    configKey,
    ...rest
}) => {

    return (
        <Box display="flex" alignItems={"center"} flexDirection={"column"} gap="10px" {...rest}>
            <Box display="flex" justifyContent="space-between" width={"100%"}>
                <Text>{label}</Text>
                <ConfigTimeText configKey={configKey} />
            </Box>
            <EventButton eventKey={configKey} event={event} loading={true} label="Update" />
        </Box>
    );
}

export default ConfigUpdateButton;