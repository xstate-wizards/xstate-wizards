// Make a parser helper function to simplify calling this
// https://www.npmjs.com/package/google-libphonenumber

import { $TSFixMe } from "../types";
import { PHONE_NUMBER_TYPES } from "../constants/phoneNumberTypes";

const PNF = require("google-libphonenumber").PhoneNumberFormat;

type TParseTel = {
  error: $TSFixMe;
  formatE164: string | null;
  formatInOriginalFormat: string | null;
  formatInternational: string | null;
  formatNational: string | null;
  formatOutOfCountryCallingNumberUS: string | null;
  formatOutOfCountryCallingNumber: string | null;
  getCountryCode: $TSFixMe;
  getNationalNumber: $TSFixMe;
  getNumberType: $TSFixMe;
  getNumberTypeEnum: $TSFixMe;
  getRegionCodeForNumber: $TSFixMe;
  inputPhoneNumber: $TSFixMe;
  inputPhoneNumberCleaned: $TSFixMe;
  inputRegionCode: $TSFixMe;
  isPossibleNumber: boolean;
  isValidNumber: boolean;
  isValidNumberForRegion: boolean;
  number: $TSFixMe;
};

export const parseTel = (inputPhoneNumber: string, inputRegionCode?: string): TParseTel => {
  // Not sure if we need to be calling getInstance within the function but w/e
  const phoneNumberUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

  // Evaluate results off the bat so a dev doesn't have to know which instance has which func
  let inputPhoneNumberCleaned;
  let error = null;
  let formatE164 = null;
  let formatInOriginalFormat = null;
  let formatInternational = null;
  let formatNational = null;
  let formatOutOfCountryCallingNumberUS = null;
  let formatOutOfCountryCallingNumber = null;
  let getCountryCode = null;
  let getNationalNumber = null;
  let getNumberType = null;
  let getNumberTypeEnum = null;
  let getRegionCodeForNumber = null;
  let isPossibleNumber = null;
  let isValidNumber = null;
  let isValidNumberForRegion = null;
  let number: $TSFixMe = null;

  // Number Instance Methods
  try {
    // --- clean up non-digits & special characters
    inputPhoneNumberCleaned = inputPhoneNumber.replace(/[^0-9|+]/g, "");
    // --- cast w/ lib
    number = phoneNumberUtil.parseAndKeepRawInput(inputPhoneNumberCleaned, inputRegionCode);
  } catch (e) {
    error = e;
  }
  if (number) {
    getCountryCode = number.getCountryCode();
    getNationalNumber = number.getNationalNumber();
    // Phone Utils Methods
    formatE164 = phoneNumberUtil.format(number, PNF.E164);
    formatInOriginalFormat = phoneNumberUtil.formatInOriginalFormat(number);
    formatInternational = phoneNumberUtil.format(number, PNF.INTERNATIONAL);
    formatNational = phoneNumberUtil.format(number, PNF.NATIONAL);
    formatOutOfCountryCallingNumberUS = phoneNumberUtil.formatOutOfCountryCallingNumber(number, "US");
    formatOutOfCountryCallingNumber = (regionCode?: string) =>
      phoneNumberUtil.formatOutOfCountryCallingNumber(number, regionCode);
    getRegionCodeForNumber = phoneNumberUtil.getRegionCodeForNumber(number);
    getNumberType = phoneNumberUtil.getNumberType(number);
    getNumberTypeEnum = Object.values(PHONE_NUMBER_TYPES)[getNumberType] ?? PHONE_NUMBER_TYPES.UNKNOWN;
    isPossibleNumber = phoneNumberUtil.isPossibleNumber(number);
    isValidNumber = phoneNumberUtil.isValidNumber(number);
    isValidNumberForRegion = phoneNumberUtil.isValidNumberForRegion(number);
  }

  // Catch all errs so we don't interrupt returning values
  return {
    error,
    formatE164,
    formatInOriginalFormat,
    formatInternational,
    formatNational,
    formatOutOfCountryCallingNumberUS,
    formatOutOfCountryCallingNumber,
    getCountryCode,
    getNationalNumber,
    getNumberType,
    getNumberTypeEnum,
    getRegionCodeForNumber,
    inputPhoneNumber,
    inputPhoneNumberCleaned,
    inputRegionCode,
    isPossibleNumber,
    isValidNumber,
    isValidNumberForRegion,
    number,
  };
};
