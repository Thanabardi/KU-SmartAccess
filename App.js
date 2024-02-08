import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ContexProvider } from "./app/contex/AppContex";
import FaceQRScreen from "./app/screens/FaceQRScreen";
import PasswordScreen from "./app/screens/PasswordScreen";
import Footer from "./app/components/Footer";
import ConnectionStatus from "./app/components/ConnectionStatus";
import { createContext, useState } from "react";

const Stack = createNativeStackNavigator();

export const DeviceContext = createContext();

export default function App() {
  const [device, setDevice] = useState(null);

  return (
    <ContexProvider>
      <DeviceContext.Provider value={[device, setDevice]}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animationTypeForReplace: "push",
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="FaceQRScreen" component={FaceQRScreen} />
            <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <Footer />
        <ConnectionStatus />
      </DeviceContext.Provider>
    </ContexProvider>
  );
}
