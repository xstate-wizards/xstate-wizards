import React from "react";

export const Select = React.forwardRef<HTMLSelectElement, any>(
  ({ className, width, style, ...props }, ref) => (
    <select
      ref={ref}
      className={`xw__select ${className || ""}`}
      style={width ? { ...style, width } : style}
      {...props}
    />
  )
);
