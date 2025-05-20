import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./css/style.css";
import App from './App.jsx';
import { DataProvider } from './hooks/context/DataContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>,
)
