import { Tabs, TabPanels, TabPanel, Box, useBreakpointValue } from "@chakra-ui/react";
import { Navbar } from "../../components";

const NavbarLayout = ({ tabs, panels, defaultIndex = 0 }) => {
    const showLogo = useBreakpointValue({ base: false, md: true });
    console.log("showLogo", showLogo);
    
    return (
        <Tabs defaultIndex={defaultIndex}>
            <Navbar.Container>
                {showLogo && <Navbar.Logo />}
                
                <Box
                    display="flex"
                    gap="10px"
                    ml={!showLogo ? "8px" : "0px"}
                    justifyContent={!showLogo ? "center" : "flex-start"}
                    width={!showLogo ? "100%" : "auto"}
                >
                    {tabs.map(({ icon, label }, index) => (
                        <Navbar.Tab key={index} id={label.toLowerCase()} icon={icon} label={label} />
                    ))}
                </Box>
            </Navbar.Container>
            <TabPanels height="500px">
                {panels.map(({ content }, index) => (
                    <TabPanel key={index} p="0" height={"100%"}>
                        {content}
                    </TabPanel>
                ))}
            </TabPanels>
        </Tabs>
    )
};

export default NavbarLayout;