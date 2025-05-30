import { Container, EventButton, ConfigUpdateButton, ConfigSlider, ContainerLayout, ConfigCheckbox, ConfigCollapse, ConfigInput } from "../../../components";
import { Text, Box } from "@chakra-ui/react";
import { useConfig } from "../../../container/ConfigProvider";
import { useState, useEffect } from "react";

const Packs = () => {
  const [text, setText] = useState("Inject");
  const [active, setActive] = useState(true);

  const { lastUpdate } = useConfig();

  const handleTextChange = (newText = "Inject") => {
    const isValidPage = window.location.href.includes("/cards/pack/");
    if (!isValidPage) {
      setText("Visit a pack page");
      setActive(false);
    } else {
      const { packInventory, siteInventory } = lastUpdate;

      if (packInventory && siteInventory) {
        setText(newText);
        setActive(true);
      } else {
        setText("Update data");
        setActive(false);
      }
    }
  }

  useEffect(() => {
    handleTextChange();
  }, [lastUpdate]);

  return (
    <>
      <Box margin="0 auto" height="100%" width="100%" alignItems={"center"} display="flex" justifyContent="center">
        <ContainerLayout direction="row" ratios={[1.8, 1]}>
          <Box>
            <Container>
              <Box display="flex" flexDirection={"column"} gap="19px">
                <Text as="h2" mb="0px" textAlign={"center"}>Pack Changer</Text>
                <ContainerLayout direction="row" ratios={[1, 1]} gap="30px">
                  <ConfigUpdateButton configKey="packInventory" label="Open cards" />
                  <ConfigUpdateButton configKey="siteInventory" label="Site data" />
                </ContainerLayout>
                <EventButton eventKey="inject" event="packs" label={text} disabled={!active} />
              </Box>
            </Container>
            <Container padding="10px">
              <Box pt="10px" pb="10px" display="flex" flexDirection={"column"}>
                <Text as="h2" textAlign={"center"}>Options</Text>
                <ConfigSlider
                  label="Balance:"
                  min={0}
                  max={1e8}
                  logarithmic={true}
                  threshold={2.631e5}
                  configKey="packs"
                  dataKey="balance"
                />
                <ConfigSlider
                  label="A counter:"
                  min={1}
                  max={39}
                  configKey="packs"
                  dataKey="counter"
                />
                <ConfigSlider
                  label="S counter:"
                  min={1}
                  max={1800}
                  configKey="packs"
                  dataKey="garantS"
                />
              </Box>
            </Container>
          </Box>
          <Container padding="10px">
            <Box pt="10px" pb="10px" display="flex" flexDirection={"column"}>
              <Text as="h2" textAlign={"center"}>Chances</Text>
              <ConfigSlider
                label="ASS chance (%):"
                min={0}
                max={100}
                allowFloat={true}
                precision={2}
                configKey="packs"
                dataKey="assChance"
              />
              <ConfigSlider
                label="S chance (%):"
                min={0}
                max={100}
                allowFloat={true}
                precision={2}
                configKey="packs"
                dataKey="sChance"
              />
              <ConfigSlider
                label="A chance (%):"
                min={0}
                max={100}
                allowFloat={true}
                precision={2}
                configKey="packs"
                dataKey="aChance"
              />
              <ConfigSlider
                label="B chance (%):"
                min={0}
                max={100}
                allowFloat={true}
                precision={2}
                configKey="packs"
                dataKey="bChance"
              />
              <ConfigSlider
                label="C chance (%):"
                min={0}
                max={100}
                allowFloat={true}
                precision={2}
                configKey="packs"
                dataKey="cChance"
              />
              <ConfigSlider
                label="D chance (%):"
                min={0}
                max={100}
                allowFloat={true}
                precision={2}
                configKey="packs"
                dataKey="dChance"
              />
              <ConfigSlider
                label="E chance (%):"
                min={0}
                max={100}
                allowFloat={true}
                precision={2}
                configKey="packs"
                dataKey="eChance"
              />
              <Text as="h2" mt="1em" textAlign={"center"}>Key Binds</Text>
              <Box ms="1em">

                <ConfigCheckbox mb="0.5em" configKey="packsKeyBinds" label="Key binds" />
                <ConfigCollapse configKey="packsKeyBinds">
                  <Text>1, 2, 3 - Set number of S cards in the next pack</Text>
                  <Text>Q, W, E - Set card position in the next pack</Text>
                  <Text>Z, X, C, V, B, A, S, D, F - Bind specific card ID to the next pack</Text>
                  <Text>ESC, 0, BACKSPACE - Clear all settings</Text>
                  <Box display="flex" flexDirection={"column"} gap="10px" mt="10px">
                    <ConfigInput placeholder="Bind KeyZ card ID" isNumber configKey="packs" dataKey="card1" />
                    <ConfigInput placeholder="Bind KeyX card ID" isNumber configKey="packs" dataKey="card2" />
                    <ConfigInput placeholder="Bind KeyC card ID" isNumber configKey="packs" dataKey="card3" />
                    <ConfigInput placeholder="Bind KeyV card ID" isNumber configKey="packs" dataKey="card4" />
                    <ConfigInput placeholder="Bind KeyB card ID" isNumber configKey="packs" dataKey="card5" />
                    <ConfigInput placeholder="Bind KeyA card ID" isNumber configKey="packs" dataKey="card6" />
                    <ConfigInput placeholder="Bind KeyS card ID" isNumber configKey="packs" dataKey="card7" />
                    <ConfigInput placeholder="Bind KeyD card ID" isNumber configKey="packs" dataKey="card8" />
                    <ConfigInput placeholder="Bind KeyF card ID" isNumber configKey="packs" dataKey="card9" />
                  </Box>
                </ConfigCollapse>
              </Box>

            </Box>
          </Container>
        </ContainerLayout>
      </Box>
    </>
  );
}

export default Packs;