// Pulled from Google PhoneNumberUtil which we use in our parsePhoneNumber
// https://www.javadoc.io/doc/com.googlecode.libphonenumber/libphonenumber/8.8.7/com/google/i18n/phonenumbers/PhoneNumberUtil.PhoneNumberType.html

export const PHONE_NUMBER_TYPES = {
  FIXED_LINE: "FIXED_LINE",
  MOBILE: "MOBILE",
  // In some regions (e.g. the USA), it is impossible to distinguish between fixed-line and
  // mobile numbers by looking at the phone number itself.
  FIXED_LINE_OR_MOBILE: "FIXED_LINE_OR_MOBILE",
  // Freephone lines
  TOLL_FREE: "TOLL_FREE",
  PREMIUM_RATE: "PREMIUM_RATE",
  // The cost of this call is shared between the caller and the recipient, and is hence typically
  // less than PREMIUM_RATE calls. See // http://en.wikipedia.org/wiki/Shared_Cost_Service for
  // more information.
  SHARED_COST: "SHARED_COST",
  // Voice over IP numbers. This includes TSoIP (Telephony Service over IP).
  VOIP: "VOIP",
  // A personal number is associated with a particular person, and may be routed to either a
  // MOBILE or FIXED_LINE number. Some more information can be found here:
  // http://en.wikipedia.org/wiki/Personal_Numbers
  PERSONAL_NUMBER: "PERSONAL_NUMBER",
  PAGER: "PAGER",
  // Used for "Universal Access Numbers" or "Company Numbers". They may be further routed to
  // specific offices, but allow one number to be used for a company.
  UAN: "UAN",
  // Used for "Voice Mail Access Numbers".
  VOICEMAIL: "VOICEMAIL",
  // A phone number is of type UNKNOWN when it does not fit any of the known patterns for a
  // specific region.
  UNKNOWN: "UNKNOWN",
};
