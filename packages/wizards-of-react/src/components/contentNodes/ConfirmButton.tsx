import React, { useState } from "react";
import { $TSFixMe, TWizardSerializations } from "@xstate-wizards/spells";
import { Button as FallbackButton } from "./fallbacks/Button";

type TConfirmButtonProps = {
  buttonType?: string;
  disabled?: boolean;
  inverted?: boolean;
  serializations: TWizardSerializations;
  messagePrompts: string[];
  onConfirm: () => void;
  size?: string;
  width?: string;
};

export const ConfirmButton: React.FC<TConfirmButtonProps> = ({
  buttonType,
  disabled,
  inverted,
  messagePrompts,
  onConfirm,
  size,
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
      size={size}
      width={width}
      buttonType={buttonType}
      inverted={inverted}
      onClick={handleClick}
    >
      {messagePrompts[messageIndex]}
    </Button>
  );
};
