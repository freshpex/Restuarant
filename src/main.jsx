import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import App from './App';
import './index.css';
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';

// Error reporting service integration
const reportError = (error, errorInfo) => {
  console.error("Captured error:", error, errorInfo);

};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary 
      onError={reportError}
      onReset={() => {
        console.log("Error boundary reset");
        window.location.href = '/';
      }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
