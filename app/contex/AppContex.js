import { useContext, createContext, useState } from "react";

const AppContext = createContext({});

export const useAppContext = () => {
  return useContext(AppContext);
};

const contextField = {
  isConnectedDevice: false,
  isConnectedServer: false,
};

export function ContexProvider({ children }) {
  const [appContex, setAppContex] = useState(contextField);
  const contex = {
    appContex,
    contexMethods: { addOrReplaceContex, removeContex },
  };

  function addOrReplaceContex(key, value) {
    setAppContex((values) => ({ ...values, [key]: value }));
  }

  function removeContex(key) {
    let contex = appContex;
    if (key in contex) {
      delete contex[key];
      setAppContex(contex);
    } else {
      console.error("Contex key not found");
    }
  }

  return <AppContext.Provider value={contex}>{children}</AppContext.Provider>;
}
