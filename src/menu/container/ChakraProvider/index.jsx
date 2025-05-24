import { ChakraProvider as ChakraP } from '@chakra-ui/react';
import { useState, useEffect, createContext, useContext } from 'react';
import { themeOptions, purpleNormalTheme } from '../../theme';
import { useConfig } from '../ConfigProvider';

export const ThemeContext = createContext();

const ChakraProvider = ({children, themeName = 'purpleNormal', ...rest}) => {

    const { miscConfig } = useConfig();
    const [currentTheme, setCurrentTheme] = useState(() => {
        const selectedThemeKey = miscConfig?.theme?.selectedTheme || themeName;
        return themeOptions[selectedThemeKey] || purpleNormalTheme;
    });
    const [activeThemeName, setActiveThemeName] = useState(miscConfig?.theme?.selectedTheme || themeName);

    

    useEffect(() => {
        const selectedThemeKey = miscConfig?.theme?.selectedTheme || themeName;
        const newThemeObject = themeOptions[selectedThemeKey] || purpleNormalTheme;
        setCurrentTheme(newThemeObject);
        setActiveThemeName(selectedThemeKey);
    }, [miscConfig?.theme?.selectedTheme, themeName]);

    return (
        <ThemeContext.Provider value={{ themeName: activeThemeName, theme: currentTheme }}>
            <ChakraP theme={currentTheme} {...rest}>
                {children}
            </ChakraP>
        </ThemeContext.Provider>
    )
};

export default ChakraProvider;

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}