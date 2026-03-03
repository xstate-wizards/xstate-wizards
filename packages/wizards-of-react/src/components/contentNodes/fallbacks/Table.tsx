import React from "react";

export const Table = React.forwardRef<HTMLTableElement, any>(
  ({ className, width, style, ...props }, ref) => (
    <table
      ref={ref}
      className={`xw--table ${className || ""}`}
      style={width ? { ...style, width } : style}
      {...props}
    />
  )
);
