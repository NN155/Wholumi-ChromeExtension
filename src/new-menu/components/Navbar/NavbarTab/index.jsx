import { Tab, Icon } from "@chakra-ui/react";

const NavbarTab = ({ children, icon: IconComponent, label, ...rest }) => {
    return (
        <Tab
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="medium"
            transition="color 0.2s, background-color 0.2s"
            color="text.primary !important"
            _hover={{
                color: "text.primary",
                bg: "primary.dark",
                borderBottomColor: "#00000000", // Prevents the border from appearing on hover
            }}
            borderRadius="md"
            px={3}
            py={2}

            minH="32px"
            h="auto"

            _selected={{
                color: "text.primary",
                bg: "primary.dark",
                borderBottom: "2px solid",
                borderColor: "text.primary",
                transform: "scale(1.05)",
            }}
            textTransform={"capitalize"}
            _focus={{
                boxShadow: 'none',
                outline: 'none',
            }}
            {...rest}
        >
            {IconComponent && (
                <Icon
                    as={IconComponent}
                    boxSize="18px"
                    mr={2}
                />
            )}
            {children || label}
        </Tab>
    );
}

export default NavbarTab;