import React, { useState } from "react";
import { $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";
import { Button as FallbackButton } from "./fallbacks/Button";

type TConfirmButtonProps = {
  className?: string;
  disabled?: boolean;
  serializations: TWizardSerializations;
  messagePrompts: string[];
  onConfirm: (e?: any) => void;
  width?: string;
};

export const ConfirmButton: React.FC<TConfirmButtonProps> = ({
  className,
  disabled,
  messagePrompts,
  onConfirm,
  width,
  ...props
}) => {
  // Styled/Component Refs
  const Button: $TSFixMe = props.serializations?.components?.Button ?? FallbackButton;
  // State
  const [messageIndex, setMessageIndex] = useState(0);
  const handleClick = () => {
    if (messageIndex === messagePrompts.length - 1) {
      onConfirm();
    } else {
      setMessageIndex(messageIndex + 1);
    }
  };

  return (
    <Button
      disabled={disabled}
      className={className}
      width={width}
      onClick={handleClick}
    >
      {messagePrompts[messageIndex]}
    </Button>
  );
};
