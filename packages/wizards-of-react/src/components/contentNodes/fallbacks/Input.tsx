import React from "react";

export const Input = React.forwardRef<HTMLInputElement, any>(
  ({ className, size, isValid, width, style, ...props }, ref) => (
    <input
      ref={ref}
      className={`xw--input ${className || ""}`}
      data-size={size}
      data-invalid={isValid === false ? "" : undefined}
      style={width ? { ...style, width } : style}
      {...props}
    />
  )
);
