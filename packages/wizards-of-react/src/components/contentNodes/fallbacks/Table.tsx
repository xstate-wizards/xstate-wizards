import React from "react";

export const Table = React.forwardRef<HTMLTableElement, any>(
  ({ className, size, width, style, ...props }, ref) => (
    <table
      ref={ref}
      className={`xw--table ${className || ""}`}
      data-size={size || undefined}
      style={width ? { ...style, width } : style}
      {...props}
    />
  )
);
