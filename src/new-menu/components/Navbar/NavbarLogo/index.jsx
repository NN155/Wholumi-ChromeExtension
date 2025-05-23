import { Box, Text, Image } from "@chakra-ui/react";

const NavbarLogo = () => {
    let logoUrl = chrome?.runtime?.getURL('assets/wholumi-logo.png') || "assets/wholumi-logo.png";

    return (
        <Box

            color="text.primary"
            display="flex"
            alignItems="center"
            textDecoration="none"
        >
            <Image
                src={logoUrl}
                w="70px"
                ms="10px"
                me="10px"
                alt="Wholumi logo"
            />
            <Text
                as="h1"
                fontSize="24px"
                fontWeight="bold"
            >Wholumi</Text>
        </Box>
    )
}

export default NavbarLogo;