import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Screener } from "./Screener";

export const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScreening, setIsScreening] = useState(false);

  // Simulating a delay to load up the screener
  useEffect(() => {
    if (!isScreening && isLoading) {
      setTimeout(() => setIsScreening(true), 0); // was delaying for example sake idk, got rid of it
    }
  }, [isLoading, isScreening]);

  // RENDER
  return (
    <StyledHome>
      <div className="home__header">
        <h1>XState-Wizards</h1>
        <p>Click "Start" to demo a screener UI and later a full-width interview UI.</p>
        <div>
          <button disabled={isLoading || isScreening} onClick={() => setIsLoading(true)}>
            Start
          </button>
        </div>
      </div>
      <div className="home__body">
        {isScreening ? (
          <div className="home__body__screener">
            <Screener
              onClose={() => {
                setIsLoading(false);
                setIsScreening(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </StyledHome>
  );
};

const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: sans-serif;
  background: #fafafa;
  min-height: 100vh;

  .home__header {
    text-align: center;
    margin: 24px 0;
    h1 {
      font-size: 20px;
      font-weight: 700;
    }
    p {
      font-size: 13px;
      opacity: 0.8;
      margin: 12px 0;
    }
    button {
      margin: 4px 0;
      padding: 4px 12px;
      border: none;
      background: blue;
      color: white;
      border-radius: 4px;
      &:disabled {
        opacity: 0.3;
        background: gray;
      }
    }
  }
  .home__body {
    height: 480px;
    min-height: 480px;
    max-height: 480px;
    width: 100%;
    max-width: 480px;
    margin: 24px;
    & > p {
      text-align: center;
    }
  }
  .home__body__screener {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: rgb(50 50 223 / 25%) 0px 50px 100px -20px, rgb(0 0 0 / 30%) 0px 30px 60px -30px;
    padding: 24px;
  }
`;
