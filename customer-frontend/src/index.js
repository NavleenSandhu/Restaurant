import App from './App';
import { CartProvider } from './contexts/CartContext'
import { createRoot } from 'react-dom/client';
import { TableNumberProvider } from './contexts/TableNumberContext';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<TableNumberProvider><CartProvider>
    <App />
</CartProvider></TableNumberProvider>);