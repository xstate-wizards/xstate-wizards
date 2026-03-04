import React, { useEffect, useState } from "react";
import { Screener } from "./Screener";

export const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScreening, setIsScreening] = useState(false);

  // Simulating a delay to load up the screener
  useEffect(() => {
    if (!isScreening && isLoading) {
      setTimeout(() => setIsScreening(true), 0);
    }
  }, [isLoading, isScreening]);

  // RENDER
  return (
    <div className="app">
      <header className="app-header">
        <h1>XState-Wizards</h1>
        <div className="app-header__controls">
          <button disabled={isLoading || isScreening} onClick={() => setIsLoading(true)}>
            Start Demo
          </button>
        </div>
      </header>
      <div className="app-body">
        {isScreening ? (
          <div className="app-body__screener">
            <Screener
              onClose={() => {
                setIsLoading(false);
                setIsScreening(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
