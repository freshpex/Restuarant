import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser, clearError } from "../redux/slices/authSlice";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header2 from "../Pages/Header/Header2";
import { FaSpinner } from "react-icons/fa";

const Registration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );
  const formRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUsingUrl, setIsUsingUrl] = useState(false); // Default to not using URL for simplicity
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, navigate, dispatch]);

  // Define the validateForm function that was missing
  const validateForm = () => {
    const form = formRef.current;
    let isValid = true;

    // Validate name
    if (!form.name.value.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    // Validate email
    if (!form.email.value.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validate password
    if (!form.password.value) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (form.password.value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Validate phone (if provided)
    if (
      form.phone.value &&
      !/^\+?[0-9\s\-()]{7,15}$/.test(form.phone.value.trim())
    ) {
      setPhoneError("Please enter a valid phone number");
      isValid = false;
    } else {
      setPhoneError("");
    }

    return isValid;
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.match("image.*")) {
        toast.error("Please select an image file");
        return;
      }

      setProfileImage(file);

      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleUploadMethod = () => {
    setIsUsingUrl(!isUsingUrl);
    setProfileImage(null);
    setImagePreview("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Reset error states
    setPasswordError("");
    setEmailError("");
    setNameError("");
    setPhoneError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    const form = formRef.current;

    // Prepare user data
    const userData = {
      displayName: form.name.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      photoURL: isUsingUrl && form.photo?.value ? form.photo.value : null,
      phone: form.phone.value.trim() || null, // Add phone to userData
    };

    setIsSubmitting(true);

    try {
      await dispatch(
        registerUser({
          userData,
          profileImage: profileImage || null,
        }),
      ).unwrap();

      navigate("/");
      toast.success(`Welcome to Tim's Kitchen, ${userData.displayName}!`);
    } catch (error) {
      console.error("Registration error:", error);

      if (typeof error === "string") {
        if (error.includes("email-already-in-use")) {
          setEmailError("Email is already in use");
        } else if (error.includes("weak-password")) {
          setPasswordError("Password is too weak");
        } else {
          toast.error(error || "Registration failed");
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Registration</title>
      </Helmet>
      <Header2 />
      <div className="w-full relative">
        <img
          className="w-full h-[400px] bg-center bg-cover object-cover"
          src="https://png.pngtree.com/thumb_back/fh260/back_our/20190621/ourmid/pngtree-black-meat-western-food-banner-background-image_194600.jpg"
          alt=""
        />
      </div>
      <div className="brightness-90 absolute w-full top-56 flex justify-center">
        <h2 className="text-white text-5xl tracking-widest">Registration</h2>
      </div>

      <div className="bg-[#121212] py-20 lg:py-10">
        <section>
          <div className="flex flex-col items-center px-6 py-8 mx-auto md:h-[100vh] lg:py-0 my-20">
            <div className="w-full bg-gray-200 rounded-lg border md:mt-0 sm:max-w-lg xl:p-0">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-white py-8 px-4 w-full rounded-md text-center bg-gray-900 md:text-2xl">
                  Register Your Account
                </h1>
                <form
                  ref={formRef}
                  onSubmit={handleRegister}
                  className="space-y-4 md:space-y-6"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-2 text-base font-medium text-gray-900"
                    >
                      Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className={`bg-gray-50 border ${nameError ? "border-red-500" : "border-gray-300"} text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                      placeholder="Type your name"
                      required
                      disabled={isSubmitting}
                    />
                    {nameError && (
                      <p className="mt-1 text-sm text-red-500">{nameError}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block mb-2 text-base font-medium text-gray-900"
                    >
                      Phone Number (Required)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      className={`bg-gray-50 border ${phoneError ? "border-red-500" : "border-gray-300"} text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                      placeholder="+234 904 123 4567"
                      disabled={isSubmitting}
                      required
                    />
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Your phone number may be used for order updates or
                      delivery coordination
                    </p>
                  </div>

                  {/* Profile Photo - Optional */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-base font-medium text-gray-900">
                        Profile Photo (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={handleToggleUploadMethod}
                        className="text-xs text-blue-600 hover:text-blue-800"
                        disabled={isSubmitting}
                      >
                        {isUsingUrl
                          ? "Upload from device"
                          : "Use photo URL instead"}
                      </button>
                    </div>

                    {isUsingUrl ? (
                      <input
                        type="text"
                        name="photo"
                        id="photo"
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        placeholder="Photo URL (optional)"
                        disabled={isSubmitting}
                      />
                    ) : (
                      <div className="space-y-2">
                        {imagePreview ? (
                          <div className="mb-2 flex justify-center">
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="h-32 w-32 object-cover rounded-full border-4 border-gray-300"
                            />
                          </div>
                        ) : null}

                        <input
                          type="file"
                          name="profileImage"
                          id="profileImage"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500">
                          Optional. JPG, PNG, or GIF up to 5MB.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-base font-medium text-gray-900"
                    >
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className={`bg-gray-50 border ${emailError ? "border-red-500" : "border-gray-300"} text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                      placeholder="name@company.com"
                      required
                      disabled={isSubmitting}
                    />
                    {emailError && (
                      <p className="mt-1 text-sm text-red-500">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-base font-medium text-gray-900"
                    >
                      Password*
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className={`bg-gray-50 border ${passwordError ? "border-red-500" : "border-gray-300"} text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                      placeholder="Password (min. 6 characters)"
                      required
                      disabled={isSubmitting}
                    />
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  {error && <h2 className="text-red-600">{error}</h2>}

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        aria-describedby="terms"
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="terms"
                        className="font-light text-gray-900"
                      >
                        I accept the{" "}
                        <Link
                          className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                          to="/termsandcondition"
                        >
                          Terms and Conditions
                        </Link>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-4 text-center bg-gray-900 hover:bg-gray-600 dark:focus:ring-primary-800 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Registering...
                      </>
                    ) : (
                      "Create an account"
                    )}
                  </button>

                  {isSubmitting && profileImage && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full animate-pulse"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-center mt-1 text-gray-500">
                        Uploading profile image...
                      </p>
                    </div>
                  )}

                  <p className="text-sm font-light text-gray-900">
                    Already have an account?{" "}
                    <Link
                      to="/signIn"
                      className="font-medium text-gray-900 hover:underline dark:text-primary-500"
                    >
                      Sign In here
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Registration;
