import {
  differenceInYears,
  getDate,
  getDaysInMonth,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isValid,
  subYears,
} from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { $TSFixMe, TWizardSerializations, formatDate, parseDate } from "@xstate-wizards/spells";
import { logger } from "../../wizardDebugger";
import { Select as FallbackSelect } from "./fallbacks/Select";

type TSelectDatePickerProps = {
  disabled?: boolean;
  value: Date;
  size?: string;
  onChange: (date: Date) => void;
  serializations: TWizardSerializations;
  dateDisabled: ({ date: Date }) => boolean;
  dateStart?: Date | string;
  dateEnd?: Date | string;
};

/**
 * SelectDatePicker
 * Simpler date picking dropdowns
 */
export const SelectDatePicker: React.FC<TSelectDatePickerProps> = ({
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
  const dateStart: Date = isValid(parseDate(props.dateStart)) ? parseDate(props.dateStart) : subYears(new Date(), 100);
  const dateEnd: Date = isValid(parseDate(props.dateEnd)) ? parseDate(props.dateEnd) : new Date();
  const endYear = getYear(dateEnd);

  const isSelectDisabled = useCallback(
    props.dateDisabled ??
      (({ date }) => {
        // if an end date exists that is beyond today, then allow selecting anything
        if (isAfter(dateEnd, new Date())) return false;
        // otherwise disable any date after today
        return isAfter(date, dateEnd) || isBefore(date, dateStart);
      }),
    []
  );

  const [day, setDay] = useState<number | undefined>(value ? getDate(parseDate(value)) : undefined);
  const [month, setMonth] = useState<number | undefined>(value ? getMonth(parseDate(value)) : undefined);
  const [year, setYear] = useState<number | undefined>(value ? getYear(parseDate(value)) : undefined);
  const propagateChange = (newYear?, newMonth?, newDay?) => {
    if (newDay != null && newMonth != null && newYear != null) {
      // constructor: new Date(year, month, day)
      onChange(new Date(newYear, newMonth, newDay));
    } else {
      onChange(undefined);
    }
  };

  useEffect(() => {
    logger.debug("SelectDatePicker: ", { dateStart, dateEnd, endYear });
    // Check if initial value is selectable (will clear bad data automatically)
    if (value && isSelectDisabled({ date: parseDate(value) })) {
      setDay(undefined);
      setMonth(undefined);
      setYear(undefined);
      // HACK: If multiple date inputs are on page, we want all to render before running updates
      setTimeout(() => onChange(undefined), 0);
    }
  }, []);

  return (
    <StyledSelectDatePicker data-test-label={props["data-test-label"]}>
      <Select
        value={month ?? ""}
        disabled={disabled}
        size={size}
        onChange={(e) => {
          const newMonth = Number(e.target.value);
          setMonth(newMonth);
          // Reset day if beyond whats in month or whats allowed
          if (
            day > getDaysInMonth(new Date(year ?? endYear, newMonth)) ||
            isSelectDisabled({ date: new Date(year ?? endYear, newMonth, day) })
          ) {
            logger.info("Day is outside month selected range or not allowed to be selected, clearing its value.");
            setDay(undefined);
            propagateChange(year, newMonth, undefined);
          } else {
            propagateChange(year, newMonth, day);
          }
        }}
      >
        <option value="">-- Month --</option>
        {Array(12)
          .fill(0)
          .map((zero, i) => (
            <option key={i} value={i} disabled={year !== undefined && isSelectDisabled({ date: new Date(year, i) })}>
              {formatDate(new Date(endYear, i), "MMMM")}
            </option>
          ))}
      </Select>
      <Select
        value={day ?? ""}
        disabled={disabled || month == null}
        size={size}
        onChange={(e) => {
          const newDay = Number(e.target.value);
          setDay(newDay);
          propagateChange(year, month, newDay);
        }}
      >
        <option value="">-- Day --</option>
        {Array(month !== undefined ? getDaysInMonth(new Date(year ?? endYear, month ?? 0)) : 0)
          .fill(0)
          .map((zero, i) => (
            <option
              key={i}
              value={i + 1}
              disabled={
                year !== undefined && month !== undefined && isSelectDisabled({ date: new Date(year, month, i + 1) })
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
          propagateChange(newYear, month, day);
        }}
      >
        <option value="">-- Year --</option>
        {Array(Math.max(0, differenceInYears(dateEnd, dateStart) + 1))
          .fill(0)
          .map((_, i) => (
            <option
              key={endYear - i}
              value={endYear - i}
              disabled={isSelectDisabled({ date: new Date(endYear - i, month ?? 0, day ?? 1) })}
            >
              {endYear - i}
            </option>
          ))}
      </Select>
    </StyledSelectDatePicker>
  );
};

const StyledSelectDatePicker = styled.div`
  display: flex;
`;
