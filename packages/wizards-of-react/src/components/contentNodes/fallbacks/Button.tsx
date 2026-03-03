import React from "react";

export const Button = React.forwardRef<HTMLButtonElement, any>(
  ({ className, variant, buttonType, size, inverted, width, style, ...props }, ref) => (
    <button
      ref={ref}
      className={`xw--btn ${className || ""}`}
      data-variant={variant || buttonType || undefined}
      data-size={size || undefined}
      data-inverted={inverted ? "" : undefined}
      style={width ? { ...style, minWidth: width } : style}
      {...props}
    />
  )
);

export const ButtonLink = React.forwardRef<HTMLAnchorElement, any>(
  ({ className, variant, buttonType, size, inverted, width, style, ...props }, ref) => (
    <a
      ref={ref}
      className={`xw--btn ${className || ""}`}
      data-variant={variant || buttonType || undefined}
      data-size={size || undefined}
      data-inverted={inverted ? "" : undefined}
      style={width ? { ...style, minWidth: width } : style}
      {...props}
    />
  )
);
