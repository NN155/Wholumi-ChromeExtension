import { ConfigCheckbox, Container, } from "../../../components";
import { Text } from "@chakra-ui/react";

const Other = () => {
    return (
        <>
            <Container>
                <Text as="h2">Remelt (Not Working)</Text>
                <ConfigCheckbox
                    label="Show dubles in remelt"
                    configKey="remeltDubles"
                />
            </Container>
            <Container>
                <Text as="h2">Offer</Text>
                <ConfigCheckbox
                    label="Resolve offers"
                    configKey="offersResolver"
                />
            </Container>
            <Container>
                <Text as="h2">Propose</Text>
                <ConfigCheckbox
                    label="Propose cards"
                    configKey="propose"
                />
            </Container>
        </>
    );
}

export default Other;