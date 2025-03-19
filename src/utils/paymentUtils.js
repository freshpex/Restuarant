import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3";

// Configuration for Flutterwave payment
export const initFlutterwavePayment = (orderDetails, user, callbacks = {}) => {
  const {
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {},
  } = callbacks;

  const unitPrice = parseFloat(orderDetails.foodPrice);
  const quantity = parseInt(orderDetails.quantity);
  const totalPrice =
    orderDetails.totalPrice || (unitPrice * quantity).toFixed(2);

  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `tk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    amount: parseFloat(totalPrice),
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd,banktransfer",
    customer: {
      email: user.email,
      phone_number: "",
      name: user.displayName || orderDetails.buyerName,
    },
    customizations: {
      title: "Tim's Kitchen Payment",
      description: `Payment for ${orderDetails.foodName} x${orderDetails.quantity}`,
      logo: "/logo.png",
    },
  };

  try {
    const handleFlutterPayment = useFlutterwave(config);

    return {
      initiatePayment: () => {
        handleFlutterPayment({
          callback: (response) => {
            if (response.status === "successful") {
              onSuccess(response);
            } else {
              onError(new Error("Payment was not successful"));
            }
            closePaymentModal();
          },
          onClose: () => {
            onClose();
          },
        });
      },
    };
  } catch (error) {
    console.error("Flutterwave initialization error:", error);
    onError(error);
    return { initiatePayment: () => {} };
  }
};

// Helper to create WhatsApp chat link
export const createWhatsAppLink = (phoneNumber, orderDetails) => {
  const formattedPhone = phoneNumber.replace(/\D/g, "");

  const unitPrice = parseFloat(orderDetails.foodPrice);
  const quantity = parseInt(orderDetails.quantity);
  const totalPrice =
    orderDetails.totalPrice || (unitPrice * quantity).toFixed(2);

  const message = encodeURIComponent(
    `Hello! I'd like to order:
    - Food: ${orderDetails.foodName}
    - Quantity: ${quantity}
    - Price: ₦${orderDetails.foodPrice} each
    - Total: ₦${totalPrice}
    - Order Date: ${orderDetails.date}
    
    My name is ${orderDetails.buyerName}.
    Please confirm if this order is available.`,
  );

  // Return WhatsApp web link
  return `https://wa.me/${formattedPhone}?text=${message}`;
};

// Handle Flutterwave payment errors
export const handlePaymentError = (error) => {
  console.error("Payment error:", error);

  if (error.message && error.message.includes("API key")) {
    return "Invalid payment configuration. Please contact support.";
  }

  if (error.message && error.message.includes("network")) {
    return "Network error. Please check your internet connection and try again.";
  }

  return "Payment initialization failed. Please try again later.";
};
