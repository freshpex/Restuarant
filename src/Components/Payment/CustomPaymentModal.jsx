import React, { useState, useEffect, useRef } from "react";
import {
  FaSpinner,
  FaCopy,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CustomPaymentModal = ({
  isOpen,
  onClose,
  amount,
  orderId,
  orderReference,
  onConfirmSuccess,
  apiUrl,
}) => {
  const [stage, setStage] = useState("initial");
  const [checkCount, setCheckCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  const bankDetails = {
    bankName: "Monie Point Microfinance Bank",
    accountNumber: "5466515889",
    accountName: "Tim's Kitchen4U",
    amount: amount,
  };

  // Copy to clipboard
  const copyToClipboard = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${type} copied to clipboard`);
      })
      .catch(() => {
        toast.error(`Failed to copy ${type}`);
      });
  };

  const handleConfirmPayment = () => {
    setStage("confirming");
    startPolling();
  };

  // Polling logic
  const startPolling = () => {
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    // Small delay before first check
    setTimeout(() => {
      checkPaymentStatus();
      intervalRef.current = setInterval(() => {
        checkPaymentStatus();
      }, 12000);
    }, 2000);

    // Stop polling after 5 minutes if not confirmed
    timeoutRef.current = setTimeout(
      () => {
        if (!paymentConfirmed) {
          setStage("timeout");
          clearInterval(intervalRef.current);
          clearInterval(timerRef.current);
        }
      },
      5 * 60 * 1000,
    );
  };

  // Check payment status from the backend (no auth token required)
  const checkPaymentStatus = async () => {
    setCheckCount((prev) => prev + 1);
    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check payment status");
      }

      const data = await response.json();
      if (data.paymentStatus === "paid") {
        handlePaymentSuccess();
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  // On payment success
  const handlePaymentSuccess = () => {
    setPaymentConfirmed(true);
    setStage("success");
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    setTimeout(() => {
      onConfirmSuccess();
    }, 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // Format time for display
  const formatTimeElapsed = () => {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Prompt user if they try to close mid-confirmation
  const handleCloseAttempt = () => {
    if (stage === "confirming") {
      const confirmed = window.confirm(
        "Are you sure you want to leave? We are still confirming your payment. Closing this window may result in payment verification issues.",
      );
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-2 md:mx-4 overflow-hidden"
        >
          {/* Stage-based rendering */}
          {stage === "initial" && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaMoneyBillWave className="text-yellow-600" />
                  <h2 className="text-lg md:text-xl font-bold">
                    Tim's Kitchen Cart Checkout
                  </h2>
                </div>
                <button
                  onClick={handleCloseAttempt}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body: Desktop & Mobile Layout */}
              <div className="md:flex">
                <div className="w-full md:w-2/3 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-500 mb-1">Transaction</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-medium text-gray-800">
                        NGN {amount}
                      </p>
                      <button
                        onClick={() => window.alert("Transaction breakdown")}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Transaction breakdown
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    Proceed to your bank app to complete this transfer
                  </p>

                  <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md mb-6">
                    <p className="text-xs text-yellow-700">
                      For a seamless transaction, please transfer the exact
                      amount displayed. Payments may be declined if the amount
                      does not match.
                    </p>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Amount
                      </label>
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <p className="text-sm font-semibold text-gray-700">
                          NGN {bankDetails.amount}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `NGN ${bankDetails.amount}`,
                              "Amount",
                            )
                          }
                          className="text-blue-600 text-xs flex items-center"
                        >
                          <FaCopy className="mr-1" /> Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Account Number
                      </label>
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <p className="text-sm font-mono font-bold">
                          {bankDetails.accountNumber}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              bankDetails.accountNumber,
                              "Account number",
                            )
                          }
                          className="text-blue-600 text-xs flex items-center"
                        >
                          <FaCopy className="mr-1" /> Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Bank Name
                      </label>
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <p className="text-sm font-semibold">
                          {bankDetails.bankName}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(bankDetails.bankName, "Bank name")
                          }
                          className="text-blue-600 text-xs flex items-center"
                        >
                          <FaCopy className="mr-1" /> Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Beneficiary
                      </label>
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <p className="text-sm font-semibold">
                          {bankDetails.accountName}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              bankDetails.accountName,
                              "Beneficiary",
                            )
                          }
                          className="text-blue-600 text-xs flex items-center"
                        >
                          <FaCopy className="mr-1" /> Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    This account detail will expire soon and can only be used
                    for this transaction.
                  </p>

                  {/* Button: I've made this bank transfer */}
                  <button
                    onClick={handleConfirmPayment}
                    className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded text-sm font-medium flex items-center justify-center"
                  >
                    <FaCheckCircle className="mr-2" /> I have made this bank
                    transfer
                  </button>
                </div>

                {/* Right Side: Payment Options */}
                <div className="w-full md:w-1/3 p-4">
                  <h3 className="text-sm text-gray-500 mb-2">
                    Payment Options
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <input
                        type="radio"
                        id="card"
                        name="paymentOption"
                        className="mr-2"
                        disabled
                      />
                      <label htmlFor="card" className="text-gray-700 text-sm">
                        Card
                      </label>
                    </li>
                    <li className="flex items-center">
                      <input
                        type="radio"
                        id="usd"
                        name="paymentOption"
                        className="mr-2"
                        disabled
                      />
                      <label htmlFor="usd" className="text-gray-700 text-sm">
                        Whatsapp
                      </label>
                    </li>
                    <li className="flex items-center">
                      <input
                        type="radio"
                        id="bank"
                        name="paymentOption"
                        defaultChecked
                        className="mr-2"
                      />
                      <label htmlFor="bank" className="text-gray-700 text-sm">
                        Bank
                      </label>
                    </li>
                  </ul>

                  <div className="mt-4 border-t pt-4">
                    <button
                      type="button"
                      className="block w-full text-left py-2 px-3 bg-yellow-100 text-yellow-800 rounded text-sm"
                    >
                      Bank Transfer
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer with reference and cancel */}
              <div className="px-4 py-3 border-t border-gray-200 text-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Order Reference</p>
                  <p className="text-sm font-mono font-medium">
                    {orderReference}
                  </p>
                </div>
                <button
                  onClick={handleCloseAttempt}
                  className="text-gray-500 hover:text-gray-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {stage === "confirming" && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaMoneyBillWave className="text-yellow-600" />
                  <h2 className="text-lg md:text-xl font-bold">
                    Tim's Kitchen Cart Checkout
                  </h2>
                </div>
                <button
                  onClick={handleCloseAttempt}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body: Confirming animation */}
              <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-sm md:text-base font-medium text-gray-700">
                  We are confirming your transfer. This could take about 4mins
                  58secs.
                  <br className="hidden md:block" />
                  Please do not refresh this page.
                </p>

                {/* Animated spinner (or swirl) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-yellow-500 text-4xl my-4"
                >
                  <FaSpinner />
                </motion.div>

                {/* Payment steps (for illustration) */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                    <span className="text-sm text-gray-700">Payment made</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border-2 border-green-500" />
                    <span className="text-sm text-gray-700">
                      Payment confirmed
                    </span>
                  </div>
                </div>

                {/* Time/Checks */}
                <div className="flex space-x-8 my-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Time Elapsed</p>
                    <p className="font-mono font-bold text-sm flex items-center justify-center">
                      <FaClock className="mr-1 text-gray-600" />{" "}
                      {formatTimeElapsed()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Status Checks</p>
                    <p className="font-mono font-bold text-sm">{checkCount}</p>
                  </div>
                </div>

                {/* Progress bar simulating bank check */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <motion.div
                    className="bg-yellow-600 h-2 rounded-full"
                    initial={{ width: "5%" }}
                    animate={{ width: ["5%", "98%"] }}
                    transition={{ duration: 180, ease: "easeInOut" }}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Need help with the transaction?
                </p>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-400">Secured by ETech</p>
                <p className="text-xs text-gray-500">
                  Order Reference: {orderReference}
                </p>
              </div>
            </>
          )}

          {stage === "success" && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaMoneyBillWave className="text-yellow-600" />
                  <h2 className="text-lg md:text-xl font-bold">
                    Tim's Kitchen Cart Checkout
                  </h2>
                </div>
                <button
                  onClick={handleCloseAttempt}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Success Body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="flex justify-center mb-4"
                >
                  <FaCheckCircle className="text-green-500 text-5xl md:text-6xl" />
                </motion.div>

                <h3 className="text-xl md:text-2xl font-bold text-green-600 mb-3">
                  Payment Successful!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Your payment has been confirmed and your order is now being
                  processed.
                </p>

                <p className="text-xs text-gray-400">
                  Redirecting you to order confirmation...
                </p>
              </motion.div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Order Reference: {orderReference}
                </p>
                <p className="text-xs text-gray-400">Secured by Flutterwave</p>
              </div>
            </>
          )}

          {stage === "timeout" && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaMoneyBillWave className="text-yellow-600" />
                  <h2 className="text-lg md:text-xl font-bold">
                    Tim's Kitchen Cart Checkout
                  </h2>
                </div>
                <button
                  onClick={handleCloseAttempt}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Timeout Body */}
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <FaExclamationCircle className="text-yellow-600 text-4xl" />
                </div>

                <h3 className="text-xl font-bold mb-3">
                  Verification Taking Longer
                </h3>
                <p className="text-gray-600 mb-6">
                  We haven't confirmed your payment yet. This could be due to:
                </p>

                <ul className="text-left text-gray-600 space-y-2 mb-6 mx-auto max-w-sm">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Bank processing delays</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Incorrect amount or reference number</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Payment hasn't been made yet</span>
                  </li>
                </ul>

                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 justify-center">
                  <button
                    onClick={() => {
                      setStage("confirming");
                      startPolling();
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md font-medium text-sm"
                  >
                    Keep Waiting
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/track-order/${orderReference}`;
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium text-sm"
                  >
                    Track Order Status
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Order Reference: {orderReference}
                </p>
                <p className="text-xs text-gray-400">Secured by Flutterwave</p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CustomPaymentModal;
