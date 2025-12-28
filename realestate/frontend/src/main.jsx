import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WishlistProvider } from './context/Wishlist.jsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </StrictMode>
  );
} else {
  console.error('Root element not found!');
}
