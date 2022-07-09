import { omit } from "lodash";
import { $TSFixMe } from "../types";

export function setupMetaSession(session) {
  const metaSession: $TSFixMe = session
    ? omit(
        session,
        Object.keys(session).filter((k) => /^machine/.test(k))
      )
    : null;
  if (metaSession && window?.navigator?.webdriver) {
    // always treat e2e webdriver tests as fresh interview sessions
    metaSession.hasPreviouslyFinished = false;
  }
  return metaSession;
}
