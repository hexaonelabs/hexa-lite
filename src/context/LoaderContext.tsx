
import React, { createContext, useContext, useEffect, useState } from "react"
import { useIonLoading } from "@ionic/react";



// Define the type for the user context.
type LoaderContextType = {
  isVisible: boolean;
  display: () => Promise<void>;
  hide: () => Promise<void>;
};
const LoaderContext = createContext<LoaderContextType>({
  isVisible: false,
  display: () => Promise.resolve(),
  hide: () => Promise.resolve(),
})

// Custom hook for accessing user context data.
export const useLoader = () => useContext(LoaderContext)

// Provider component that wraps parts of the app that need user context.
export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [
    present,
    dismiss,
  ] = useIonLoading();

  return (
    <LoaderContext.Provider
      value={{
        isVisible,
        display: async (message = 'Please wait...') => present({
          message,
          cssClass: 'custom-loading',
          translucent: true,
          showBackdrop: true,
          spinner: "lines",
          onDidPresent: () => setIsVisible(true)
        }),
        hide: async () => {
          await dismiss();
          setIsVisible(false);
        },
      }}
    >
      {children}
    </LoaderContext.Provider>
  )
}