import React, { useState } from "react";


export const Dialog = ({ children, trigger, ...props }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div onClick={() => setIsDialogOpen(!isDialogOpen)}>
      {trigger ? trigger : null}
      {isDialogOpen && (
        <div className="xw-sb__dialog-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
