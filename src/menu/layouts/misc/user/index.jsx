import { Input, Container, Button, ConfigCheckbox, ConfigCollapse } from "../../../components";
import { Box, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useConfig } from "../../../container/ConfigProvider";

const User = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { miscConfig, setUserConfig } = useConfig();

    const [placeholders, setPlaceholders] = useState(miscConfig?.userConfig || {});

    useEffect(() => {
        const configValue = miscConfig?.userConfig;
        if (configValue) {
            setPlaceholders(configValue);
        }
    }, [miscConfig]);

    const handleSave = () => {
        setUserConfig({
            username: username,
            password: password,
        });
        setUsername("");
        setPassword("");
    }

    return (
        <>
            <Container>
                <Box display="flex" flexDirection="column" gap="10px">
                    <Text as="h2" fontWeight="bold">User Settings</Text>
                    <ConfigCheckbox
                        label="Auto Login"
                        configKey="autoLogin"
                    />
                </Box>
            </Container>

            <ConfigCollapse configKey="autoLogin">
                <Container>
                    <Box display="flex" flexDirection="column" gap="10px" alignItems="center">
                        <Text as="h2" fontWeight="bold">Auto Login Settings</Text>
                        <Box display="flex" flexDirection="column" gap="10px" width="100%" maxWidth="300px">
                            <Input
                                placeholder={`Username${placeholders?.username ? ` (${placeholders.username})` : ""}`}
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value)
                                }}
                                autoComplete="username"
                            />
                            <Input
                                placeholder={`Password${placeholders?.password ? ` (${placeholders.password})` : ""}`}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <Button label="Save" onClick={handleSave} />
                        </Box>
                    </Box>
                </Container>
            </ConfigCollapse>
        </>
    );
}

export default User;