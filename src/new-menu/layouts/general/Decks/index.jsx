import { ConfigCheckbox, Container, ConfigCollapse } from "../../../components";
import { Text, Box } from "@chakra-ui/react";

const Decks = () => {
    return (
        <>
            <Container>
                <Text as="h2">Deck Builder</Text>
                <ConfigCheckbox 
                    label="Build deck"
                    configKey="deckBuilder"
                />
            </Container>
            
            <Container>
                <Text as="h2">Decks Progress info</Text>
                <Box>
                <ConfigCheckbox 
                    label="Decks progress analyzer" 
                    configKey="decksProgress"
                />
                
                <ConfigCollapse configKey="decksProgress">
                    <Box ms="1em" mt="10px" display="flex" flexDirection="column" gap="10px">
                        <ConfigCheckbox 
                            label="Deep analyzing"
                            configKey="decksProgressDeep"
                        />
                    </Box>
                </ConfigCollapse>
                </Box>
            </Container>
        </>
    );
}

export default Decks;