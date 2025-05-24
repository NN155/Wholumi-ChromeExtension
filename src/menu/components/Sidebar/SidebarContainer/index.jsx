import { TabList, useTheme, useToken } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

const SidebarContainer = (props) => {
  const theme = useTheme();

  const bgColor = transparentize('primary.main', 0.05)(theme);


  return (
    <TabList
      display= 'flex'
      flexDirection= 'column'
      gap= '10px'
      padding= '20px'
      width= '150px'
      backgroundColor= {bgColor}
      borderBottom= '0px solid'
      borderRight= '1px solid'
      borderColor= "primary.dark"
      height= '100%'
      overflowY= 'auto'
      {...props}
    />
  );
}

export default SidebarContainer;