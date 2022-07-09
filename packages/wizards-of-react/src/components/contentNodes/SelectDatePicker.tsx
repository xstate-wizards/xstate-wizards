import { getDate, getDaysInMonth, getMonth, getYear, isAfter } from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { $TSFixMe, TWizardSerializations, formatDate, parseDate } from "@xstate-wizards/spells";
import { logger } from "../../wizardDebugger";

type TSelectDatePickerProps = {
  dateDisabled: ({ date: Date }) => boolean;
  disabled?: boolean;
  value: Date;
  size?: string;
  onChange: (date: Date) => void;
  serializations: TWizardSerializations;
};

const FallbackSelect = styled.select``;

/**
 * SelectDatePicker
 * Simpler date picking dropdowns
 */
export const SelectDatePicker: React.FC<TSelectDatePickerProps> = ({
  dateDisabled,
  disabled,
  onChange,
  size = "sm",
  value,
  serializations,
  ...props
}) => {
  // Styled/Component Refs
  const Select: $TSFixMe = serializations?.components?.Select ?? FallbackSelect;
  // State
  const currentYear = getYear(new Date());
  const isSelectDisabled = useCallback(dateDisabled ?? (({ date }) => isAfter(date, new Date())), []);
  const [day, setDay] = useState(value ? getDate(parseDate(value)) : undefined);
  const [monthIndex, setMonthIndex] = useState(value ? getMonth(parseDate(value)) : undefined);
  const [year, setYear] = useState(value ? getYear(parseDate(value)) : undefined);
  const propagateChange = (newYear?, newMonthIndex?, newDay?) => {
    if (newDay != null && newMonthIndex != null && newYear != null) {
      // constructor: new Date(year, monthIndex, day)
      onChange(new Date(newYear, newMonthIndex, newDay));
    } else {
      onChange(undefined);
    }
  };

  useEffect(() => {
    // Check if initial value is selectable (will clear bad data automatically)
    if (value && isSelectDisabled({ date: parseDate(value) })) {
      setDay(undefined);
      setMonthIndex(undefined);
      setYear(undefined);
      // HACK: If multiple date inputs are on page, we want all to render before running updates
      setTimeout(() => onChange(undefined), 0);
    }
  }, []);

  return (
    <StyledSelectDatePicker data-test-label={props["data-test-label"]}>
      <Select
        value={monthIndex ?? ""}
        disabled={disabled}
        size={size}
        onChange={(e) => {
          const newMonthIndex = Number(e.target.value);
          setMonthIndex(newMonthIndex);
          // Reset day if beyond whats in month or whats allowed
          if (
            day > getDaysInMonth(new Date(year ?? currentYear, newMonthIndex)) ||
            isSelectDisabled({ date: new Date(year ?? currentYear, newMonthIndex, day) })
          ) {
            logger.info("Day is outside month selected range or not allowed to be selected, clearing its value.");
            setDay(undefined);
            propagateChange(year, newMonthIndex, undefined);
          } else {
            propagateChange(year, newMonthIndex, day);
          }
        }}
      >
        <option value="">-- Month --</option>
        {Array(12)
          .fill(0)
          .map((zero, i) => (
            <option key={i} value={i} disabled={year !== undefined && isSelectDisabled({ date: new Date(year, i) })}>
              {formatDate(new Date(currentYear, i), "MMMM")}
            </option>
          ))}
      </Select>
      <Select
        value={day ?? ""}
        disabled={disabled || monthIndex == null}
        size={size}
        onChange={(e) => {
          const newDay = Number(e.target.value);
          setDay(newDay);
          propagateChange(year, monthIndex, newDay);
        }}
      >
        <option value="">-- Day --</option>
        {Array(monthIndex !== undefined ? getDaysInMonth(new Date(year ?? currentYear, monthIndex ?? 0)) : 0)
          .fill(0)
          .map((zero, i) => (
            <option
              key={i}
              value={i + 1}
              disabled={
                year !== undefined &&
                monthIndex !== undefined &&
                isSelectDisabled({ date: new Date(year, monthIndex, i + 1) })
              }
            >
              {i + 1}
            </option>
          ))}
      </Select>
      <Select
        value={year ?? ""}
        disabled={disabled}
        size={size}
        onChange={(e) => {
          const newYear = Number(e.target.value);
          setYear(newYear);
          propagateChange(newYear, monthIndex, day);
        }}
      >
        <option value="">-- Year --</option>
        {Array(100)
          .fill(0)
          .map((zero, i) => (
            <option
              key={currentYear - i}
              value={currentYear - i}
              disabled={isSelectDisabled({ date: new Date(currentYear - i, monthIndex ?? 0, day ?? 1) })}
            >
              {currentYear - i}
            </option>
          ))}
      </Select>
    </StyledSelectDatePicker>
  );
};

const StyledSelectDatePicker = styled.div`
  display: flex;
`;
