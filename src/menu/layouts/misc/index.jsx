import User from './user';
import Other from './other';
import { SidebarLayout } from "..";

const MiscLayout = () => {
    return (
        <SidebarLayout
            tabs={[
                { label: "User" },
                { label: "Other"}
            ]}
            panels={[
                { content: <User /> },
                { content: <Other />}
            ]}
        />
    );
}

export default MiscLayout;