// Credit: Mateusz Rybczonec, https://codepen.io/geoffgraham/pen/yLywVbW

import React, { useState } from "react";
import { useInterval } from "react-use";
import styled from "styled-components";
import { TWizardSerializations } from "@xstate-wizards/spells";

const FULL_DASH_ARRAY = 283;
const COUNTDOWN_INTERVAL = 1000;

const FallbackIcon = styled.div``;

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
  const IconCheck = props.serializations?.components?.IconCheck ?? FallbackIcon;
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
    <StyledCountdownTimer>
      <svg className="countdown__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g className="countdown__circle">
          <circle className={`countdown__path-elapsed ${status}`} cx="50" cy="50" r="45" />
          <path
            strokeDasharray={strokeDashArray}
            className={`countdown__path-remaining ${status}`}
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          />
        </g>
      </svg>
      <span className={`countdown__label ${status}`}>
        {Math.floor(timeLeft / 1000) === 0 ? (
          <>
            <IconCheck />
          </>
        ) : (
          Math.floor(timeLeft / 1000)
        )}
      </span>
    </StyledCountdownTimer>
  );
};

const StyledCountdownTimer = styled.div`
  position: relative;
  width: 48px;
  height: 48px;

  .countdown__svg {
    transform: scaleX(-1);
  }

  .countdown__circle {
    fill: none;
    stroke: none;
  }

  .countdown__path-elapsed {
    stroke-width: 7px;
    stroke: ${(props) => props.theme.colors.brand[900]};
    transition: 1s linear all;
  }
  .countdown__path-elapsed.done {
    color: ${(props) => props.theme.colors.brand[500]};
    stroke: currentColor;
  }
  .countdown__path-elapsed.progressing {
    color: ${(props) => props.theme.colors.brand[500]};
  }

  .countdown__path-remaining {
    stroke-width: 8px;
    stroke-linecap: round;
    transform: rotate(90deg);
    transform-origin: center;
    transition: 1s linear all;
    fill-rule: nonzero;
    stroke: currentColor;
  }
  .countdown__path-remaining.done {
    color: ${(props) => props.theme.colors.brand[500]};
  }
  .countdown__path-remaining.progressing {
    color: ${(props) => props.theme.colors.brand[500]};
  }

  .countdown__label {
    position: absolute;
    width: 48px;
    height: 48px;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
    color: ${(props) => props.theme.colors.brand[500]};
    svg {
      height: 24px;
      width: 24px;
      path {
        fill: ${(props) => props.theme.colors.brand[500]};
      }
    }
  }
`;
