import { SidebarLayout } from ".."
import { Text } from "@chakra-ui/react";
import Cards from "./Cards"
import Club from "./club"
import Decks from "./Decks"
import Other from "./Other"

const GeneralLayout = () => {
    return (
            <SidebarLayout
                tabs={[
                    { label: "Cards" },
                    { label: "Club" },
                    { label: "Decks" },
                    { label: "Other" },
                ]}
                panels={[
                    { content: <Cards/> },
                    { content: <Club /> },
                    { content: <Decks /> },
                    { content: <Other /> },
                ]}
            />
    )
}

export default GeneralLayout;