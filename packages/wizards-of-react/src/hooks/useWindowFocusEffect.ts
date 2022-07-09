import { useEffect } from "react";
import { $TSFixMe } from "@xstate-wizards/spells";

export function useWindowFocusEffect(fn: $TSFixMe, compareParams: Array<any> = []) {
  useEffect(() => {
    if (!window) return;

    window.addEventListener("focus", fn);
    return () => window.removeEventListener("focus", fn);
  }, compareParams);
}
