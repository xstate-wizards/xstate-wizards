import React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, any>(
  ({ className, width, style, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`xw--textarea ${className || ""}`}
      style={width ? { ...style, width } : style}
      {...props}
    />
  )
);
