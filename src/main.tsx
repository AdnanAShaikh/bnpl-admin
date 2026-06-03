import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from './store/persistor.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
       <Provider store={store}>
         <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
               <App />
            </BrowserRouter>
         </PersistGate> 
       </Provider>   
      <ToastContainer
         position="top-center"
         autoClose={1000}
         hideProgressBar={false}
         closeOnClick
         pauseOnHover
         theme="light"
      />
  </StrictMode>,
)
