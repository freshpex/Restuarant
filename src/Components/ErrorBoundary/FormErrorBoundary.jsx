import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import { FaExclamationCircle, FaRedo } from "react-icons/fa";
import PropTypes from "prop-types";

const FormFallback = ({ error, resetError, formName }) => {
  return (
    <div className="p-4 border border-red-200 rounded-md bg-red-50">
      <div className="flex items-center mb-3">
        <FaExclamationCircle className="text-red-500 mr-2" />
        <h3 className="font-medium text-red-700">Form Error</h3>
      </div>

      <p className="text-sm text-red-600 mb-3">
        We encountered an error with the {formName || "form"}. Please try again
        or contact support if the issue persists.
      </p>

      {error && error.message && (
        <div className="text-xs bg-white p-2 rounded border border-red-100 mb-3 font-mono text-red-800">
          {error.message}
        </div>
      )}

      <button
        onClick={resetError}
        className="flex items-center justify-center w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
      >
        <FaRedo className="mr-1" /> Try Again
      </button>
    </div>
  );
};

FormFallback.propTypes = {
  error: PropTypes.object,
  resetError: PropTypes.func.isRequired,
  formName: PropTypes.string,
};

const FormErrorBoundary = ({ children, formName }) => {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <FormFallback
          error={error}
          resetError={resetError}
          formName={formName}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

FormErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  formName: PropTypes.string,
};

export default FormErrorBoundary;
