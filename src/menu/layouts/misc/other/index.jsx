import { ConfigCheckbox, Container, } from "../../../components";
import { Text } from "@chakra-ui/react";

const Other = () => {
    return (
        <>
            <Container>
                <Text as="h2">Development</Text>
                <ConfigCheckbox
                    label="Show logs in console"
                    configKey="testMode"
                />
            </Container>
        </>
    );
}

export default Other;