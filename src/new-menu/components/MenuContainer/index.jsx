import { Box, useTheme } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

const MenuContainer = (props) => {
    const theme = useTheme();
    
    const shadowColor = transparentize('primary.main', 0.3)(theme);

    return (
        <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            bg="darkMode.card"
            borderRadius="10px"
            boxShadow={`0 4px 20px ${shadowColor}`}
            width="900px"
            overflow="hidden"
            border="1px solid"
            borderColor="primary.dark"
            userSelect="none"
            {...props}
        />
    );
}

export default MenuContainer;