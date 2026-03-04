import React from "react";

export const Button = React.forwardRef<HTMLButtonElement, any>(
  ({ className, width, style, ...props }, ref) => (
    <button
      ref={ref}
      className={`xw__btn ${className || ""}`}
      style={width ? { ...style, minWidth: width } : style}
      {...props}
    />
  )
);

export const ButtonLink = React.forwardRef<HTMLAnchorElement, any>(
  ({ className, width, style, ...props }, ref) => (
    <a
      ref={ref}
      className={`xw__btn ${className || ""}`}
      style={width ? { ...style, minWidth: width } : style}
      {...props}
    />
  )
);
