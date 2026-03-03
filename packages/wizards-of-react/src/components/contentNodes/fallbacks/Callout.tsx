import React from "react";

export const Callout = React.forwardRef<HTMLDivElement, any>(
  ({ className, variant, styleType, textAlign, style, ...props }, ref) => (
    <div
      ref={ref}
      className={`xw--callout ${className || ""}`}
      data-variant={variant || styleType || undefined}
      style={textAlign ? { ...style, textAlign } : style}
      {...props}
    />
  )
);
