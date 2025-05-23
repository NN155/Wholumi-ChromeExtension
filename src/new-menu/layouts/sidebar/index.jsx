import { Tabs, TabPanels, TabPanel, Box } from "@chakra-ui/react";
import { Sidebar } from "../../components";

const SidebarLayout = ({ tabs, panels, defaultIndex = 0 }) => {
    const showSidebar = tabs.length > 1 && panels.length > 1;
    
    if (!showSidebar) {
        return (
            <Box height="100%" overflow="auto">
                {panels[0]?.content || <Box>Without content</Box>}
            </Box>
        );
    }
    
    return (
        <Tabs defaultIndex={defaultIndex} display="flex" height="100%">
            <Sidebar.Container>
                {tabs.map(({ icon, label }, index) => (
                    <Sidebar.Tab 
                        key={index} 
                        id={label.toLowerCase()} 
                        icon={icon} 
                        label={label}
                    />
                ))}
            </Sidebar.Container>
            <TabPanels>
                {panels.map(({ content }, index) => (
                    <TabPanel key={index} height="100%" overflow="auto">
                        {content}
                    </TabPanel>
                ))}
            </TabPanels>
        </Tabs>
    );
};

export default SidebarLayout;