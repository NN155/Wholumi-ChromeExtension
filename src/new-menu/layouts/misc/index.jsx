import User from './user';
import { SidebarLayout } from "..";

const MiscLayout = () => {
    return (
        <SidebarLayout
            tabs={[
                { label: "User" },
            ]}
            panels={[
                { content: <User /> },
            ]}
        />
    );
}

export default MiscLayout;