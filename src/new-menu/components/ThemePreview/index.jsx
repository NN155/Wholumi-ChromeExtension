import { Box, Flex } from "@chakra-ui/react";
import { useMemo } from "react";

const ThemePreview = ({
  theme = {},
  selected = false,
  onClick,
  width = "100%",
  maxWidth = "120px",
  height = "80px",
  ...rest
}) => {

  const colors = theme.colors || {};

  const themeColors = {
    primaryMain: colors.primary?.main,
    primaryDark: colors.primary?.dark,
    primaryLight: colors.primary?.light,
    background: colors.darkMode?.bg,
    card: colors.darkMode?.card,
    cardHover: colors.darkMode?.cardHover,
    textPrimary: colors.text?.primary,
    textSecondary: colors.text?.secondary,
  };

  const sizes = useMemo(() => {
    const numericHeight = parseInt(height);
    const isNumeric = !isNaN(numericHeight);
    
    if (!isNumeric) {
      return {
        headerHeight: "20%",
        contentPadding: "5px",
        cardHeight: "60%",
        textLineHeight: "2px",
        buttonHeight: "15%",
        lineGap: "3px",
      };
    }
    
    return {
      headerHeight: "20%",
      contentPadding: `${Math.max(5, numericHeight / 16)}px`,
      cardHeight: `${Math.max(30, numericHeight * 0.35)}px`,
      textLineHeight: `${Math.max(2, numericHeight / 40)}px`,
      buttonHeight: `${Math.max(8, numericHeight / 10)}px`,
      lineGap: `${Math.max(3, numericHeight / 25)}px`,
      borderRadius: `${Math.max(3, numericHeight / 25)}px`,
      cardBorderRadius: `${Math.max(3, numericHeight / 25)}px`,
    };
  }, [height]);

  return (
    <Box
      width={width}
      maxWidth={maxWidth}
      height={height}
      borderRadius={sizes.borderRadius}
      overflow="hidden"
      border="1px solid"
      boxShadow={selected ? `0 4px 20px ${themeColors.primaryMain}4D`: "none"}
      borderColor={selected ? themeColors.primaryLight : "transparent"}
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
      }}
      {...rest}
    >
      <Box bg={themeColors.primaryMain} height={sizes.headerHeight} />

      <Box bg={themeColors.background} height="80%" p={sizes.contentPadding}>
        <Box
          bg={themeColors.card}
          height={sizes.cardHeight}
          mb={sizes.lineGap}
          borderRadius={sizes.cardBorderRadius}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          paddingY={sizes.contentPadding}
        >
          <Box
            bg={themeColors.textPrimary}
            width="60%"
            height={sizes.textLineHeight}
            mt={sizes.contentPadding}
            ml={sizes.contentPadding}
            borderRadius="1px"
            opacity={0.7}
          />

          <Box
            bg={themeColors.primaryMain}
            width="40%"
            height={sizes.buttonHeight}
            mt={sizes.contentPadding}
            mx={sizes.contentPadding}
            borderRadius={`${parseInt(sizes.borderRadius)/2}px`}
          />
        </Box>

        <Flex gap={sizes.lineGap} flexDirection="column">
          <Box
            bg={themeColors.textPrimary}
            width="80%"
            height={sizes.textLineHeight}
            borderRadius="1px"
            opacity={0.7}
          />
          <Box
            bg={themeColors.textSecondary}
            width="60%"
            height={sizes.textLineHeight}
            borderRadius="1px"
            opacity={0.5}
          />
        </Flex>
      </Box>
    </Box>
  );
};

export default ThemePreview;