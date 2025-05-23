import { Button as ChakraButton, useTheme } from '@chakra-ui/react';
import { darken } from '@chakra-ui/theme-tools';
import { useState } from 'react';
import { PointsLoading } from '..';

const Button = ({ label, onClick, children, disabled = false, loading = false, ...rest }) => {
    const [isActive, setIsActive] = useState(disabled);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const hover = darken('primary.dark', 10)(theme);
    const active = darken('primary.dark', 20)(theme);

    async function handleClick() {
        setIsActive(true);
        loading && setIsLoading(true);
        onClick && await onClick();
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsLoading(false);
        setIsActive(false);
    }

    return (
        <ChakraButton
            onClick={handleClick}
            bg="primary.dark"
            minWidth="100px"
            width="100%"
            size="md"
            borderRadius="md"
            color="text.buttonPrimary"
            isDisabled={isActive}
            textTransform={'none'}
            _hover={{ bg: hover, color: 'text.buttonSecondary' }}
            _active={{ bg: active, color: 'text.buttonSecondary' }}
            _disabled={{
                bg: active,
                color: 'text.buttonSecondary',
                cursor: 'pointer',
                opacity: 0.5,
            }}
            _focus={{
                boxShadow: 'none',
                outline: 'none',
            }}
            {...rest}
        >   {
                loading && isLoading ? (
                    <PointsLoading
                        color="text.buttonSecondary"
                        baseColor="text.buttonPrimary"
                    />
                ) : (
                    label || children
                )
            }

        </ChakraButton>
    );
}

export default Button;