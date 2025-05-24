import Theme from "./theme";
import { SidebarLayout } from ".."

const VisualLayout = () => {
  return (
    <SidebarLayout
      tabs={[
        { label: "Theme" },
      ]}
      panels={[
        { content: <Theme /> },
      ]}
    />
  )
}

export default VisualLayout;