import React from "react";

export const H0 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h1 ref={ref} className={`xw__h0 ${className || ""}`} {...props} />
);

export const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h1 ref={ref} className={`xw__h1 ${className || ""}`} {...props} />
);

export const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h2 ref={ref} className={`xw__h2 ${className || ""}`} {...props} />
);

export const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={`xw__h3 ${className || ""}`} {...props} />
);

export const H4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h4 ref={ref} className={`xw__h4 ${className || ""}`} {...props} />
);

export const H5 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h5 ref={ref} className={`xw__h5 ${className || ""}`} {...props} />
);

export const H6 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h6 ref={ref} className={`xw__h6 ${className || ""}`} {...props} />
);
