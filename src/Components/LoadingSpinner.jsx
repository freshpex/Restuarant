import React from "react";
import PropTypes from "prop-types";
import { FaSpinner } from "react-icons/fa";

const LoadingSpinner = ({
  size = "md",
  color = "text-yellow-700",
  className = "",
  text = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FaSpinner className={`animate-spin ${sizeClasses[size]} ${color}`} />
      {text && <span className="ml-2">{text}</span>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  color: PropTypes.string,
  className: PropTypes.string,
  text: PropTypes.string,
};

export default LoadingSpinner;
