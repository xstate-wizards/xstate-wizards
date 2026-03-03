import React from "react";

export const InputRow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`xw--input-row ${className || ""}`} {...props} />
  )
);
