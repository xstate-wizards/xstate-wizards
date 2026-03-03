import React from "react";

export const A = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <a ref={ref} className={`xw--a ${className || ""}`} {...props} />
  )
);
