import { useEffect } from "react";
import { $TSFixMe } from "../types";

export function useWindowFocusEffect(fn: $TSFixMe, compareParams: Array<any> = []) {
  useEffect(() => {
    if (!window) return;
    window.addEventListener("focus", fn);
    return () => window.removeEventListener("focus", fn);
  }, compareParams);
}
