import React from "react";

export const Small = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <small ref={ref} className={`xw--small ${className || ""}`} {...props} />
  )
);
