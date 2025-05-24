import { useState, useEffect } from "react";
import { ThemePreview, Container } from "../../../components";
import { themeOptions } from "../../../theme";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { useConfig } from "../../../container/ConfigProvider";

const Theme = () => {
  const { miscConfig, setMiscConfigGroup } = useConfig();
  const [selectedTheme, setSelectedTheme] = useState(miscConfig.theme?.selectedTheme || "default");

  useEffect(() => {
    const configTheme = miscConfig.theme?.selectedTheme;
    if (configTheme && configTheme !== selectedTheme) {
      setSelectedTheme(configTheme);
    }
  }, [miscConfig.theme?.selectedTheme, selectedTheme]);

  const handleThemeChange = (themeKey) => {
    setSelectedTheme(themeKey);
    setMiscConfigGroup("theme", { selectedTheme: themeKey });
  };


  return (

    <Container>
      <Text as="h2" textAlign={"center"}>Themes</Text>

      <SimpleGrid columns={[3, 3, 3]} spacing="20px" mt="20px" placeItems="center">
        {Object.entries(themeOptions).map(([key, theme]) => (
          <ThemePreview
            key={key}
            theme={theme}
            height="150px"
            maxWidth="200"
            selected={selectedTheme === key}
            onClick={() => handleThemeChange(key)}
          />
        ))}
      </SimpleGrid>
    </Container>

  );
};

export default Theme;