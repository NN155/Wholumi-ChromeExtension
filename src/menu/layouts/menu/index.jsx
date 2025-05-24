import { MenuContainer, Menu } from "../../components"

import { IoSettingsSharp } from "react-icons/io5";
import { FaSmileBeam, FaPalette } from "react-icons/fa";
import { BsFillGrid1X2Fill } from "react-icons/bs";
import { NavbarLayout, GeneralLayout, FunLayout, MiscLayout, VisualLayout } from ".."

const MenuLayout = () => {
    return (
        <Menu>
            <MenuContainer>
                <NavbarLayout
                    tabs={[
                        { icon: BsFillGrid1X2Fill, label: "general" },
                        { icon: FaSmileBeam, label: "fun" },
                        { icon: IoSettingsSharp, label: "misc" },
                        { icon: FaPalette, label: "visual" },
                    ]}
                    panels={[
                        { content: <GeneralLayout /> },
                        { content: <FunLayout /> },
                        { content: <MiscLayout /> },
                        { content: <VisualLayout /> },
                    ]}
                />
            </MenuContainer>
        </Menu>
    );
};

export default MenuLayout;