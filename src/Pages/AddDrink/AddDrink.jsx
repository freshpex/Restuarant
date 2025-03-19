import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDrink } from "../../redux/slices/drinkActionsSlice";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import {
  FaSpinner,
  FaImage,
  FaUpload,
  FaLink,
  FaImages,
  FaGlassMartini,
} from "react-icons/fa";

const AddDrink = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUsingUrl, setIsUsingUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsUsingUrl(false);
    }
  };

  // Handle switching between URL and file upload
  const handleToggleUploadMethod = () => {
    setIsUsingUrl(!isUsingUrl);
    if (!isUsingUrl) {
      setImageFile(null);
      setPreviewUrl("");
    }
  };

  const handleAddDrink = async (e) => {
    e.preventDefault();
    const form = e.target;

    // Validate image is provided either as file or URL
    if (!imageFile && !form.image?.value && !isUsingUrl) {
      toast.error("Please provide a drink image");
      return;
    }

    // Set loading state to true
    setIsSubmitting(true);

    const drinkData = {
      buyerName: user.displayName,
      email: user.email,
      drinkName: form.drink.value,
      drinkPrice: form.price.value,
      drinkCategory: form.category.value,
      drinkDescription: form.description.value,
      drinkOrigin: form.origin.value,
      drinkQuantity: form.quantity.value,
    };

    // If using URL instead of file upload
    if (isUsingUrl) {
      drinkData.drinkImage = form.image.value;
    }

    try {
      await dispatch(
        addDrink({
          drinkData,
          token,
          imageFile: isUsingUrl ? null : imageFile,
        }),
      ).unwrap();
      toast.success("Drink added successfully");
      form.reset();
      setImageFile(null);
      setPreviewUrl("");
    } catch (error) {
      toast.error(error || "Failed to add drink");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Add Drink</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Header */}
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-8">
              <h1 className="text-3xl font-bold text-gray-800 text-center">
                Add New Drink Item
              </h1>
              <p className="text-center mt-2 text-gray-600">
                Enter the details below to add a new drink to the menu
              </p>
            </div>

            <form onSubmit={handleAddDrink} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info Section */}
                <div className="space-y-6 col-span-full md:col-span-1">
                  <h2 className="text-lg font-medium text-gray-900 border-b pb-2">
                    User Information
                  </h2>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      defaultValue={user.displayName}
                      type="text"
                      name="name"
                      id="name"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter name"
                      required
                      disabled={isSubmitting || true}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      defaultValue={user.email}
                      type="email"
                      name="email"
                      id="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter email"
                      required
                      disabled={isSubmitting || true}
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-6 col-span-full md:col-span-1">
                  <h2 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Drink Image
                  </h2>

                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <FaGlassMartini className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Upload Drink Image
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleUploadMethod}
                      className="text-xs text-blue-600 hover:text-blue-800 transition duration-150 flex items-center"
                      disabled={isSubmitting}
                    >
                      {isUsingUrl ? (
                        <>
                          <FaUpload className="mr-1" />
                          Switch to file upload
                        </>
                      ) : (
                        <>
                          <FaLink className="mr-1" />
                          Use image URL instead
                        </>
                      )}
                    </button>
                  </div>

                  {isUsingUrl ? (
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLink className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="image"
                        id="image"
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="https://example.com/image.jpg"
                        required={isUsingUrl}
                        disabled={isSubmitting}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full">
                      <label
                        htmlFor="imageFile"
                        className={`flex flex-col items-center justify-center w-full h-40 border-2 ${imageFile ? "border-blue-300 bg-blue-50" : "border-gray-300 border-dashed bg-gray-50"} rounded-lg cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        onMouseEnter={() => setIsImageHovered(true)}
                        onMouseLeave={() => setIsImageHovered(false)}
                      >
                        {!previewUrl ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-3">
                            <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 text-center">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 text-center">
                              PNG, JPG or WEBP (MAX. 2MB)
                            </p>
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            <img
                              src={previewUrl}
                              alt="Drink preview"
                              className="h-full w-full object-contain p-2"
                            />
                            {isImageHovered && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
                                <p className="text-white text-sm font-medium">
                                  Change Image
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <input
                          type="file"
                          name="imageFile"
                          id="imageFile"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required={!isUsingUrl && !previewUrl}
                          disabled={isSubmitting}
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        {previewUrl ? "Click the image to change it" : ""}
                      </p>
                    </div>
                  )}
                </div>

                {/* Drink Details Section */}
                <div className="col-span-full border-t pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Drink Details
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="drink"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Drink Name*
                      </label>
                      <input
                        type="text"
                        name="drink"
                        id="drink"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Enter drink name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Price*
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Enter drink price in naira"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Short Description
                      </label>
                      <input
                        type="text"
                        name="description"
                        id="description"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Enter description (optional)"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Drink Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        id="category"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Enter drink category (optional)"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="origin"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Drink Origin
                      </label>
                      <input
                        type="text"
                        name="origin"
                        id="origin"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Enter drink origin (optional)"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Drink Quantity*
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        id="quantity"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Enter drink quantity"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button with loading spinner */}
              <button
                type="submit"
                className={`flex w-full justify-center items-center px-5 py-2.5 mt-4 sm:mt-6 text-lg font-medium text-center hover:bg-gray-800 bg-gray-900 text-white rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-primary-800"}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Add Drink Item"
                )}
              </button>

              {isSubmitting && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full animate-pulse"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-500">
                    Your image is being uploaded. Please wait...
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDrink;
