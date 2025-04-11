import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary";
import { registerSW } from "virtual:pwa-register";
import toast from "react-hot-toast";

const updateCheckInterval = 60 * 60 * 1000;

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    const toastId = toast(
      (t) => (
        <div className="flex flex-col items-start">
          <p className="font-medium text-gray-800">App Update Available</p>
          <p className="text-sm text-gray-600 mt-1">
            A new version is available with the latest features and improvements.
          </p>
          <div className="flex mt-3 space-x-3">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                updateSW(true);
              }}
              className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
            >
              Update Now
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
            >
              Later
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "bottom-center",
        className: "border border-gray-200 p-3 bg-white rounded-lg shadow-lg",
      }
    );
  },
  onOfflineReady() {
    toast.success("App ready to work offline", {
      position: "bottom-center",
      duration: 3000
    });
  },
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  interval: updateCheckInterval,
});

// Error reporting service integration
const reportError = (error, errorInfo) => {
  console.error("Captured error:", error, errorInfo);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={reportError}
      onReset={() => {
        console.log("Error boundary reset");
        window.location.href = "/";
      }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);
