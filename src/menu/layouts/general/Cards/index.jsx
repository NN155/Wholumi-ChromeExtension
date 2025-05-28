import { Container, ConfigCheckbox, ConfigCollapse } from "../../../components";
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
                            label="Trade Helper (Not woriking)" 
                            configKey="tradeHelper"
                        />
                    </Box>
                </ConfigCollapse>
                </Box>
            </Container>
        </>
    );
}

export default Cards;