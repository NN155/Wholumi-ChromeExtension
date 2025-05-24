import { Box, keyframes } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useScrollLock } from '../../container/hooks/useScrollLock';

const fadeInAnimation = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    backdrop-filter: blur(5px);
  }
`;

const fadeOutAnimation = keyframes`
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
    backdrop-filter: blur(5px);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
    backdrop-filter: blur(0px);
  }
`;

const Menu = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    useScrollLock(isVisible);
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Insert') {
                setIsVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <Box 
            visibility={isVisible ? 'visible' : 'hidden'}
            opacity={isVisible ? 1 : 0}
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            zIndex={9999}
            pointerEvents={isVisible ? 'auto' : 'none'}
            animation={isVisible 
                ? `${fadeInAnimation} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards`
                : `${fadeOutAnimation} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards`
            }
            sx={{
                '& > *': {
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isVisible
                        ? 'translateY(0) scale(1)'
                        : 'translateY(-20px) scale(0.95)',
                }
            }}
        >
            {children}
        </Box>
    );
};

export default Menu;