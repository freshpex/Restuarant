import React from "react";
import { FaSpinner } from "react-icons/fa";
import { formatPrice, capitalizeWords } from "../../../utils/formatUtils";

const AddOrderModal = ({
  showModal,
  closeModal,
  newOrder,
  handleOrderInputChange,
  handleFoodSelect,
  handleQuantityChange,
  createOrder,
  isCreatingOrder,
  availableFoods,
  isLoadingFoods,
  selectedFood,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Add Manual Order</h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={createOrder} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium mb-3">Customer Information</h4>

              <div className="mb-3">
                <label
                  htmlFor="buyerName"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Customer Name*
                </label>
                <input
                  type="text"
                  id="buyerName"
                  name="buyerName"
                  value={newOrder.buyerName}
                  onChange={handleOrderInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Customer's full name"
                  required
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newOrder.email}
                  onChange={handleOrderInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Customer's email address"
                  required
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="phone"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newOrder.phone}
                  onChange={handleOrderInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Customer's phone number"
                  required
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Order Details</h4>

              <div className="mb-3">
                <label
                  htmlFor="foodId"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Food Item*
                </label>
                {isLoadingFoods ? (
                  <div className="flex items-center text-gray-500">
                    <FaSpinner className="animate-spin mr-2" /> Loading food
                    items...
                  </div>
                ) : (
                  <select
                    id="foodId"
                    name="foodId"
                    value={newOrder.foodId}
                    onChange={handleFoodSelect}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    required
                  >
                    <option value="">-- Select a food item --</option>
                    {availableFoods.map((food) => (
                      <option key={food._id} value={food._id}>
                        {food.foodName} -{" "}
                        {formatPrice(parseFloat(food.foodPrice))}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-3">
                <label
                  htmlFor="quantity"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Quantity*
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={newOrder.quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="totalPrice"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Total Price
                </label>
                <input
                  type="text"
                  id="totalPrice"
                  name="totalPrice"
                  value={`${formatPrice(newOrder.totalPrice) || "0.00"}`}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium mb-3">Delivery Information</h4>

              <div className="mb-3">
                <label
                  htmlFor="deliveryLocation"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Delivery Location*
                </label>
                <select
                  id="deliveryLocation"
                  name="deliveryLocation"
                  value={newOrder.deliveryLocation}
                  onChange={handleOrderInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="emaudo">Emaudo Campus</option>
                  <option value="town">Town</option>
                  <option value="village">Village</option>
                </select>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="fullAddress"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Full Address*
                </label>
                <textarea
                  id="fullAddress"
                  name="fullAddress"
                  value={newOrder.fullAddress}
                  onChange={handleOrderInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Detailed delivery address"
                  required
                ></textarea>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Payment Information</h4>

              <div className="mb-3">
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Payment Method*
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={newOrder.paymentMethod}
                  onChange={handleOrderInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="cash">Cash (In Person)</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="paymentStatus"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Payment Status*
                </label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={newOrder.paymentStatus}
                  onChange={handleOrderInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="status"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Order Status*
                </label>
                <select
                  id="status"
                  name="status"
                  value={newOrder.status}
                  onChange={handleOrderInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="mr-2 px-4 py-2 text-sm border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingOrder}
              className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
            >
              {isCreatingOrder ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Creating Order...
                </>
              ) : (
                "Create Order"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;
