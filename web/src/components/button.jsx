import React from "react";

const Button = ({ text, type = "button" }) => {
  return (
    <button type={type} className="btn">
      {text}
    </button>
  );
};

export default Button;