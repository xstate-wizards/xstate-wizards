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
  getCountryCode: string | null;
  getNationalNumber: $TSFixMe;
  getNumberType: $TSFixMe;
  getNumberTypeEnum: $TSFixMe;
  getRegionCodeForNumber: $TSFixMe;
  inputPhoneNumber: $TSFixMe;
  inputPhoneNumberCleaned: $TSFixMe;
  inputRegionCode: $TSFixMe;
  //there is a looser check called isPossibleNumber that's faster & looser, but IMO I advise
  //against exposing it as we've run into problems with consistency between isPossibleNumber
  //& isValidNumber
  isValidNumber: boolean;
  isValidNumberForRegion: boolean;
  number: $TSFixMe;
};

export const parseTel = (inputPhoneNumber: string, inputRegionCode?: string): TParseTel => {
  // Not sure if we need to be calling getInstance within the function but w/e
  const phoneNumberUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

  // Evaluate results off the bat so a dev doesn't have to know which instance has which func
  let inputPhoneNumberCleaned: string;
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
  let isValidNumber = null;
  let isValidNumberForRegion = null;
  let phoneNumber: $TSFixMe = null;

  // Number Instance Methods
  try {
    // --- clean up non-digits & special characters
    inputPhoneNumberCleaned = inputPhoneNumber.replace(/[^0-9|+]/g, "");

    // --- cast w/ lib
    //Note: expects country code prepended with "+" but its own getCountryCode method doesn't include the "+"
    phoneNumber = phoneNumberUtil.parseAndKeepRawInput(inputPhoneNumberCleaned, inputRegionCode);
  } catch (e) {
    error = e;
  }
  if (phoneNumber) {
    //this is annoying because the package expects the "+" in front of the area code in parseAndKeepRawInput
    //but doesn't include it in getCountryCode() by default, so we add it ourselves
    getCountryCode = `+${phoneNumber.getCountryCode()}`;
    getNationalNumber = phoneNumber.getNationalNumber();
    // Phone Utils Methods
    formatE164 = phoneNumberUtil.format(phoneNumber, PNF.E164);
    formatInOriginalFormat = phoneNumberUtil.formatInOriginalFormat(phoneNumber);
    formatInternational = phoneNumberUtil.format(phoneNumber, PNF.INTERNATIONAL);
    formatNational = phoneNumberUtil.format(phoneNumber, PNF.NATIONAL);
    formatOutOfCountryCallingNumberUS = phoneNumberUtil.formatOutOfCountryCallingNumber(phoneNumber, "US");
    formatOutOfCountryCallingNumber = (regionCode?: string) =>
      phoneNumberUtil.formatOutOfCountryCallingNumber(phoneNumber, regionCode);
    getRegionCodeForNumber = phoneNumberUtil.getRegionCodeForNumber(phoneNumber);
    getNumberType = phoneNumberUtil.getNumberType(phoneNumber);
    getNumberTypeEnum = Object.values(PHONE_NUMBER_TYPES)[getNumberType] ?? PHONE_NUMBER_TYPES.UNKNOWN;
    isValidNumber = phoneNumberUtil.isValidNumber(phoneNumber);
    isValidNumberForRegion = phoneNumberUtil.isValidNumberForRegion(phoneNumber);
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
    isValidNumber,
    isValidNumberForRegion,
    number: phoneNumber,
  };
};
