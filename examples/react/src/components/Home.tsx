import React, { useState } from "react";
import { Screener } from "./Screener";

export const Home = () => {
  const [isScreening, setIsScreening] = useState(false);

  return (
    <div>
      <div>
        <p>hi, welcome lets get started</p>
      </div>
      <div>
        <button onClick={() => setIsScreening(true)}>get started</button>
      </div>
      {isScreening && (
        <>
          <p>mocking the fetching data as if there was an api... wait a few seconds</p>
          <Screener onClose={() => setIsScreening(false)} />
        </>
      )}
    </div>
  );
};
