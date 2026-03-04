import React from "react";

export const Callout = React.forwardRef<HTMLDivElement, any>(
  ({ className, textAlign, style, ...props }, ref) => (
    <div
      ref={ref}
      className={`xw__callout ${className || ""}`}
      style={textAlign ? { ...style, textAlign } : style}
      {...props}
    />
  )
);
