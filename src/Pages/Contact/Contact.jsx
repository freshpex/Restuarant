import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaComment,
} from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";

const showToast = (message, type) => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else {
    toast(message, {
      icon: type === "info" ? "ℹ️" : "⚠️",
      style: {
        borderRadius: "10px",
        background: type === "info" ? "#E0F2FE" : "#FEF3C7",
        color: type === "info" ? "#1E40AF" : "#92400E",
      },
    });
  }
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const form = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    try {
      setIsSending(true);

      await emailjs.sendForm(
        "service_443ptjh",
        "template_3ze54yy",
        form.current,
        "sORcFqmtnWLKiCa2l",
      );

      showToast(
        "Message sent successfully! We will get back to you soon.",
        "success",
      );
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      showToast(
        "Failed to send message. Please try again or use another contact method.",
        "error",
      );
    } finally {
      setIsSending(false);
    }
  };

  const openWhatsApp = () => {
    window.open(
      "https://wa.me/+2349041801170?text=Hello%20Tim%27s%20Kitchen,%20I%20would%20like%20to%20inquire%20about",
      "_blank",
    );
  };

  const sendEmail = () => {
    window.location.href =
      "mailto:timskitchen@tidioxyz?subject=Inquiry%20for%20Tim%27s%20Kitchen";
  };

  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Contact Us</title>
        <meta
          name="description"
          content="Get in touch with Tim's Kitchen for inquiries, feedback, or to place a special order."
        />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-[#121212] relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-800/70 to-black/70 z-10"></div>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=2069&auto=format&fit=crop"
            alt="Contact background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center relative z-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out to us with questions,
            feedback, or to place an order.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Methods */}
            <div className="col-span-1 bg-gray-50 p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-yellow-600 p-3 rounded-full text-white mr-4">
                    <FaPhone className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Phone</h3>
                    <p className="text-gray-600">+234 904 180 1170</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-600 p-3 rounded-full text-white mr-4">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Email</h3>
                    <p className="text-gray-600">timskitchen@tidioxyz</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-600 p-3 rounded-full text-white mr-4">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">
                      Location
                    </h3>
                    <p className="text-gray-600">
                      No 7, Paradise street, Emaudo, Ekpoma 311554, Edo State
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-600 p-3 rounded-full text-white mr-4">
                    <FaWhatsapp className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">
                      WhatsApp
                    </h3>
                    <button
                      onClick={openWhatsApp}
                      className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <FaWhatsapp />
                      Chat on WhatsApp
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-600 p-3 rounded-full text-white mr-4">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">
                      Send Email
                    </h3>
                    <button
                      onClick={sendEmail}
                      className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FaEnvelope />
                      Open Email Client
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-span-2 bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Send Us a Message
              </h2>

              <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Your Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Message*
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Your message here..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`flex items-center justify-center w-full md:w-auto px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors ${isSending ? "opacity-70 cursor-not-allowed" : ""}`}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <IoMdSend className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            Find Us
          </h2>
          <div className="h-[400px] w-full rounded-lg shadow-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.1077996857452!2d6.1385653!3d6.7567071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1046955ef46f11bb%3A0xcddda97c492f09b7!2sTims%20kitchen!5e0!3m2!1sen!2sng!4v1741155683818!5m2!1sen!2sng"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Live Chat Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsLiveChatOpen(!isLiveChatOpen)}
          className="bg-yellow-600 text-white p-4 rounded-full shadow-lg hover:bg-yellow-700 transition-all"
        >
          <FaComment className="text-2xl" />
        </button>

        {isLiveChatOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-yellow-600 text-white px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Live Chat</h3>
              <button
                onClick={() => setIsLiveChatOpen(false)}
                className="text-white hover:text-gray-200"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-4">
                Our live chat is currently under maintenance.
              </p>
              <p className="text-gray-700 mb-4">
                Please use WhatsApp or email for immediate assistance.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={openWhatsApp}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex-1"
                >
                  <FaWhatsapp />
                  WhatsApp
                </button>
                <button
                  onClick={sendEmail}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex-1"
                >
                  <FaEnvelope />
                  Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Contact;
