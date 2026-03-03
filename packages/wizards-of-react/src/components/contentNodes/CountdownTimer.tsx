// Credit: Mateusz Rybczonec, https://codepen.io/geoffgraham/pen/yLywVbW

import React, { useState } from "react";
import { useInterval } from "react-use";
import { TWizardSerializations } from "@xstate-wizards/spells";
import { IconCheck as FallbackIconCheck } from "./fallbacks/Icons";

const FULL_DASH_ARRAY = 283;
const COUNTDOWN_INTERVAL = 1000;

const getRemainingPathColor = (timeLeft) => {
  if (timeLeft <= 0) {
    return "done";
  }
  return "progressing";
};

const calculateTimeFraction = (timer, timerLeft) => {
  const rawTimeFraction = timerLeft / timer;
  return rawTimeFraction - (1 / timer) * (1 - rawTimeFraction);
};

type TCountdownTimerProps = {
  timer: number;
  serializations: TWizardSerializations;
};

export const CountdownTimer: React.FC<TCountdownTimerProps> = ({ timer, ...props }) => {
  // Styled/Component Refs
  const IconCheck = props.serializations?.components?.IconCheck ?? FallbackIconCheck;
  // State
  const [timePassed, setTimePassed] = useState(COUNTDOWN_INTERVAL);
  const [timeLeft, setTimeLeft] = useState(timer - COUNTDOWN_INTERVAL);
  const [strokeDashArray, setStrokeDashArray] = useState(String(FULL_DASH_ARRAY));
  const [status, setStatus] = useState("progressing");

  useInterval(() => {
    if (timeLeft > 0) {
      const nextTimePassed = timePassed + 1000;
      const nextTimeLeft = timer - nextTimePassed;
      setTimePassed(nextTimePassed);
      setTimeLeft(nextTimeLeft);
      // UI Updates
      setStrokeDashArray(`${(calculateTimeFraction(timer, nextTimeLeft) * FULL_DASH_ARRAY).toFixed(0)} 283`);
      setStatus(getRemainingPathColor(nextTimeLeft));
    }
  }, COUNTDOWN_INTERVAL);

  return (
    <div className="xw--countdown">
      <svg className="xw--countdown-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g className="xw--countdown-circle">
          <circle className={`xw--countdown-elapsed ${status}`} cx="50" cy="50" r="45" />
          <path
            strokeDasharray={strokeDashArray}
            className={`xw--countdown-remaining ${status}`}
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          />
        </g>
      </svg>
      <span className={`xw--countdown-label ${status}`}>
        {Math.floor(timeLeft / 1000) === 0 ? (
          <>
            <IconCheck />
          </>
        ) : (
          Math.floor(timeLeft / 1000)
        )}
      </span>
    </div>
  );
};
