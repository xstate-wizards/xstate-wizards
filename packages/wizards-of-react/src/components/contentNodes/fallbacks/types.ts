export type TButtonVariant = "white" | "warning" | "success" | "default";

export type TButtonCSS = {
  variant?: TButtonVariant;
  inverted?: boolean;
  disabled?: boolean;
  size?: TComponentSize;
  width?: string;
};

export type TComponentSize = "xs" | "sm" | "md" | "lg";

export interface IconProps extends React.SVGAttributes<SVGElement> {
  children?: never;
  color?: string;
}
