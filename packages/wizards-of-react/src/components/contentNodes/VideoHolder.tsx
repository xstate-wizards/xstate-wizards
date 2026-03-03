import React from "react";

type TVideoHolderProps = React.HTMLAttributes<HTMLDivElement> & {
  height?: string;
  heightMobile?: string;
  width?: string;
};

export const VideoHolder = React.forwardRef<HTMLDivElement, TVideoHolderProps>(
  ({ className, height, heightMobile, style, ...props }, ref) => (
    <div
      ref={ref}
      className={`xw--video-holder ${className || ""}`}
      style={{
        ...style,
        ...(height ? { "--xw--video-height": height } as any : {}),
        ...(heightMobile ? { "--xw--video-height-mobile": heightMobile } as any : {}),
      }}
      {...props}
    />
  )
);
