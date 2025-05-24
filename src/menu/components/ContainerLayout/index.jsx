import { Box, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';

const ContainerLayout = ({
  children,
  ratios = [],
  direction = 'column',
  maxHeight = '100%',
  width = '100%',
  spacing = '10px',
  ...rest
}) => {


  const responsiveDirection = useBreakpointValue({
    base: direction === 'row' ? 'column' : direction,
    md: direction
  });

  return (
    <Box
      display="flex"
      flexDirection={responsiveDirection}
      maxHeight={maxHeight}
      height="auto" 
      width={width}
      overflow="hidden"
      gap={spacing}
      {...rest}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        let flex;
        let boxProps = {};
        const ratio = ratios[index];

        if (ratio === undefined) {
          flex = 1;
        } else if (typeof ratio === 'string' && ratio.match(/^\d+px$|^\d+%$|^auto$/)) {
          const size = ratio;
          const prop = direction === 'column' ? 'maxHeight' : 'maxWidth';
          
          boxProps[prop] = size;
          flex = '0 0 auto';
        } else if (typeof ratio === 'number' || typeof ratio === 'string') {
          const value = Number(ratio) || 1;
          flex = value;
        }
        
        return (
          <Box 
            flex={flex} 
            height="auto" 
            minHeight="0"
            overflowY="auto" 
            display="flex"
            flexDirection="column"
            {...boxProps}
          >
            {React.cloneElement(child, { 
              flex: 'unset',
              height: 'auto',
              maxHeight: '100%'
            })}
          </Box>
        );
      })}
    </Box>
  );
};

export default ContainerLayout;