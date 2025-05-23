import { Box } from '@chakra-ui/react';

const Container = ({ children, padding="20px", overflow="auto", ...rest }) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            bg="darkMode.card"
            borderRadius="10px"
            border="1px solid"
            borderColor="primary.dark"
            userSelect="none"
            margin="10px"
            gap="10px"
            height="auto"
            minHeight="0" 
            maxHeight="calc(100% - 20px)"
            overflow="hidden"   
            {...rest}
        >
            <Box
                overflow={overflow}
                padding={padding}
            >
                {children}
            </Box>
        </Box>
    );
}

export default Container;