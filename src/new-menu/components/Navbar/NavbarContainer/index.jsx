import { TabList, useTheme, Text } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

const NavbarContainer = ({children, ...rest}) => {

  const theme = useTheme();

  const bgColor = transparentize('primary.main', 0.05)(theme);

  return (
    <TabList 
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      padding="15px 25px"
      backgroundColor={bgColor}
      borderBottom="1px solid"
      borderColor="primary.dark"
      {...rest}
    >
      {children}
    </TabList>
  );
}

export default NavbarContainer;