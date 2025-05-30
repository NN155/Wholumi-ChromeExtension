import { Container, ConfigCheckbox, ConfigCollapse, ContainerLayout, ConfigSlider } from "../../../components";
import { Text, Box } from "@chakra-ui/react";

const Cards = () => {
    return (
        <>
            <Container>
                <Text as="h2">Auto Loot Cards</Text>
                <ConfigCheckbox
                    label="Automatically collecting daily cards without watching the anime"
                    configKey="autoLootCards"
                />
            </Container>
            <ContainerLayout direction="row" ratios={[1.5, 1]}>
                <Container>
                    <Text as="h2">Cards Info</Text>
                    <Box>
                        <ConfigCheckbox
                            label="Search cards in Need/Trade/Users pages"
                            configKey="searchCards"
                        />

                        <ConfigCollapse configKey="searchCards">
                            <Box ms="1em" mt="10px" display="flex" flexDirection="column" gap="10px">
                                <ConfigCheckbox
                                    label="Search on behalf of another user"
                                    configKey="anotherUserMode"
                                />
                                <ConfigCheckbox
                                    label="Online cards only"
                                    configKey="onlineOnly"
                                />
                            </Box>
                        </ConfigCollapse>
                    </Box>
                </Container>
                <ConfigCollapse configKey="searchCards">
                    <Container overflow="hidden">
                        <Text as="h2" textAlign="center">Options</Text>
                        <ConfigSlider
                            label="Users limit: "
                            min={50}
                            max={2000}
                            configKey="searchCards"
                            dataKey="usersLimit"
                        />
                    </Container>
                </ConfigCollapse>
            </ContainerLayout>
        </>
    );
}

export default Cards;