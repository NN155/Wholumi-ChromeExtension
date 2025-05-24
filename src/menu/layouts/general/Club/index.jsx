import {
  Container,
  ConfigUpdateButton,
  ContainerLayout,
  ConfigCheckbox,
  ConfigCollapse,
  ConfigSlider,
} from "../../../components";
import { Text, Box } from "@chakra-ui/react";

const Club = () => {
  return (
    <>
      <ContainerLayout direction="row" ratios={[1.15, 1]}>
        <Box>
          <Container>
            <Text as="h2">Club Boost System</Text>
            <Box>
              <ConfigCheckbox
                label="Club Boost"
                configKey="clubBoost"
              />
              <ConfigCollapse configKey="clubBoost">
                <Box ms="1em" mt="10px" display="flex" flexDirection="column" gap="10px">
                  <ConfigCheckbox
                    label="Only open cards"
                    configKey="openCards"
                  />

                  <ConfigCheckbox
                    label="Custom boost mode"
                    configKey="customBoostMode"
                  />
                  <ConfigCheckbox
                    label="Server boost mode (Not working anymore)"
                    configKey="serverBoost"
                  />
                </Box>
              </ConfigCollapse>
            </Box>
          </Container>
          <ConfigCollapse condition={(func) => func.clubBoost && func.openCards} animateOpacity>
            <Container overflow="hidden">
              <ConfigUpdateButton
                label="Update open cards data"
                configKey="openedInventory"
              />
            </Container>
          </ConfigCollapse>
        </Box>
        <Container padding="10px">
          <Box pt="10px" pb="10px" display="flex" flexDirection={"column"}>
            <Box display="flex" flexDirection={"column"} gap="10px">
              <Text as="h2" textAlign={"center"}>Options</Text>
              <ConfigSlider
                label="Auto update delay (ms):"
                min={0}
                max={2000}
                configKey="clubBoost"
                dataKey="autoUpdateDelay"
              />
              <ConfigSlider
                label="Auto boost delay (ms):"
                min={0}
                max={1000}
                configKey="clubBoost"
                dataKey="autoBoostDelay"
              />
            </Box>
            <ConfigCollapse
              configKey="clubBoost"
            >
              <ConfigCollapse
                configKey="customBoostMode"
              >
                <Box display="flex" flexDirection={"column"} gap="10px">
                  <ConfigSlider
                    label="Custom delay trigger (ms):"
                    min={0}
                    max={1000}
                    configKey="clubBoost"
                    dataKey="customBoostTime"
                  />
                  <ConfigSlider
                    label="Custom boost delay (ms):"
                    min={0}
                    max={1000}
                    configKey="clubBoost"
                    dataKey="customBoostDelay"
                  />
                </Box>
              </ConfigCollapse>
              <ConfigCollapse
                configKey="serverBoost"
              >
                <Box display="flex" flexDirection={"column"} gap="10px">
                  <ConfigSlider
                    label="Multiply:"
                    min={1}
                    max={20}
                    configKey="clubBoost"
                    dataKey="multiply"
                  />
                </Box>
              </ConfigCollapse>
            </ConfigCollapse>
          </Box>
        </Container>
      </ContainerLayout>
    </>
  );
}

export default Club;