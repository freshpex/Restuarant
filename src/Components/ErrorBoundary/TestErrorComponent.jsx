import React, { useState } from "react";
import useErrorHandler from "./useErrorHandler";

const TestErrorComponent = () => {
  const [counter, setCounter] = useState(0);
  const setError = useErrorHandler();

  const handleIncrementClick = () => {
    setCounter((prevCounter) => prevCounter + 1);
  };

  const handleErrorClick = () => {
    setError(new Error("This is a test error from TestErrorComponent"));
  };

  const handleRuntimeError = () => {
    const obj = null;
    obj.nonExistentMethod();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Error Component</h2>
      <p className="mb-4">Counter: {counter}</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleIncrementClick}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Increment (Safe)
        </button>
        <button
          onClick={handleErrorClick}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Throw Error (Controlled)
        </button>
        <button
          onClick={handleRuntimeError}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Cause Runtime Error
        </button>
      </div>
    </div>
  );
};

export default TestErrorComponent;
