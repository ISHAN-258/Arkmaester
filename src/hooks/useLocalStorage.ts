import { useState, useEffect } from "react";
import { storageGet, storageSet } from "../utils/storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValueState] = useState<T>(initialValue);

  useEffect(() => {
    let active = true;
    storageGet(key, initialValue).then((val) => {
      if (active) {
        setValueState(val);
      }
    });
    return () => {
      active = false;
    };
  }, [key, initialValue]);

  const setValue = (newValue: T | ((val: T) => T)) => {
    setValueState((prev) => {
      const actualVal = newValue instanceof Function ? newValue(prev) : newValue;
      storageSet(key, actualVal);
      return actualVal;
    });
  };

  return [value, setValue] as const;
}
