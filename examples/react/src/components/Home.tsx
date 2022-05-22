import React, { useState } from "react";
import { Screener } from "./Screener";

export const Home = () => {
  const [isScreening, setIsScreening] = useState(false);

  return (
    <div>
      <div>
        <p>hi, welcome lets get started</p>
        <p>TODO: do you want to use the serialized/json version of interviews or javascript/function filled</p>
      </div>
      <div>
        <button onClick={() => setIsScreening(true)}>json versions</button>
        <button onClick={() => setIsScreening(true)}>javascript versions</button>
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
