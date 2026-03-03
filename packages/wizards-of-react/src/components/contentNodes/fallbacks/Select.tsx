import React from "react";

export const Select = React.forwardRef<HTMLSelectElement, any>(
  ({ className, size, isValid, width, style, ...props }, ref) => (
    <select
      ref={ref}
      className={`xw--select ${className || ""}`}
      data-size={size}
      data-invalid={isValid === false ? "" : undefined}
      style={width ? { ...style, width } : style}
      {...props}
    />
  )
);
