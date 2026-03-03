import React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, any>(
  ({ className, size, isValid, width, style, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`xw--textarea ${className || ""}`}
      data-size={size}
      data-invalid={isValid === false ? "" : undefined}
      style={width ? { ...style, width } : style}
      {...props}
    />
  )
);
