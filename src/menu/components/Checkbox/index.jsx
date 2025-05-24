import { Checkbox as ChakraCheckbox, Box, useTheme } from "@chakra-ui/react";
import { transparentize } from '@chakra-ui/theme-tools';
import { memo, useMemo } from 'react';

const Checkbox = memo(({ label, checked, onChange, ...rest }) => {
    const theme = useTheme();
    
    const glowColor = useMemo(() => 
        transparentize('primary.main', 0.7)(theme), 
        [theme]
    );

    const controlStyles = useMemo(() => ({
        '.chakra-checkbox__control': {
            borderRadius: '4px',
            borderColor: 'primary.dark',
            bg: 'darkMode.card',
            boxShadow: checked ? `0 0 10px ${glowColor}` : 'none',
            _checked: {
                bg: 'primary.main',
                borderColor: 'primary.main',
                'svg': {
                    color: 'text.buttonPrimary',
                },
            },
        }
    }), [checked, glowColor]);

    const focusStyles = useMemo(() => ({
        boxShadow: 'none',
        outline: 'none',
    }), []);

    return (
        <ChakraCheckbox 
            isChecked={checked}
            onChange={onChange}
            colorScheme="primary"
            size="md"
            sx={controlStyles}
            boxShadow='0 0 1px rgba(0, 0, 0, 0)'
            _focus={focusStyles}
            {...rest}
        >
            <Box fontWeight={checked ? "medium" : "normal"} color="text.primary">
                {label}
            </Box>
        </ChakraCheckbox>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;