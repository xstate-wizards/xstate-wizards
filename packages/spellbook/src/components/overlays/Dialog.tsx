import React, { useState } from "react";
import styled from "styled-components";

export const Dialog = ({ children, trigger, ...props }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div onClick={() => setIsDialogOpen(!isDialogOpen)}>
      {trigger ? trigger : null}
      {isDialogOpen && (
        <StyledDialog onClick={() => setIsDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </StyledDialog>
      )}
    </div>
  );
};

const StyledDialog = styled.div`
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2em;
  .dialog {
    height: auto;
    width: 100%;
    min-width: 600px;
    max-width: 920px;
    margin: 0 auto;
    background: white;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: space-between;
  }
`;
