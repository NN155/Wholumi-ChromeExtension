import Packs from './packs';
import { SidebarLayout } from ".."

const FunLayout = () => {
  return (
    <SidebarLayout
      tabs={[
        { label: "Packs" },
      ]}
      panels={[
        { content: <Packs /> },
      ]}
    />
  );
}

export default FunLayout;