import React from "react";

export const Input = React.forwardRef<HTMLInputElement, any>(
  ({ className, width, style, ...props }, ref) => (
    <input
      ref={ref}
      className={`xw__input ${className || ""}`}
      style={width ? { ...style, width } : style}
      {...props}
    />
  )
);
