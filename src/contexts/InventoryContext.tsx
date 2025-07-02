"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";

interface DarkModeState {
  darkMode: boolean;
}

type DarkModeAction =
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "LOAD_DARK_MODE"; payload: boolean };

const initialState: DarkModeState = {
  darkMode: false,
};

function darkModeReducer(
  state: DarkModeState,
  action: DarkModeAction
): DarkModeState {
  switch (action.type) {
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };
    case "LOAD_DARK_MODE":
      return { ...state, darkMode: action.payload };
    default:
      return state;
  }
}

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined
);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(darkModeReducer, initialState);

  useEffect(() => {
    // Load dark mode from localStorage
    const stored = localStorage.getItem("dark-mode");
    if (stored) {
      dispatch({ type: "LOAD_DARK_MODE", payload: stored === "true" });
    }
  }, []);

  useEffect(() => {
    // Save dark mode to localStorage
    localStorage.setItem("dark-mode", String(state.darkMode));
    if (state.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.darkMode]);

  const toggleDarkMode = () => {
    dispatch({ type: "TOGGLE_DARK_MODE" });
  };

  const value = {
    darkMode: state.darkMode,
    toggleDarkMode,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}
