import { MenuLayout } from '../../layouts/';
import ChakraProvider from '../ChakraProvider';
import ConfigProvider from '../ConfigProvider';

const App = () => {
    return (
        <ConfigProvider>
            <ChakraProvider>
                <MenuLayout />
            </ChakraProvider>
        </ConfigProvider>
    )
}

export default App;