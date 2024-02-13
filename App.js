import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ContexProvider } from "./app/contex/AppContex";
import FaceQRScreen from "./app/screens/FaceQRScreen";
import PasswordScreen from "./app/screens/PasswordScreen";
import Footer from "./app/components/Footer";
import ConfigScreen from "./app/screens/ConfigScreen";
import { navigationRef, navigate } from "./app/utils/rootNavigation";
import { serverConnection } from "./app/utils/serverConnection";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

const Stack = createNativeStackNavigator();

export default function App() {
  const appState = useRef(AppState.currentState);
  const {
    connectDoorController,
    getParticipants,
    sendFacePhoto,
    isConnectedDevice,
    isConnectedServer,
    participants,
  } = serverConnection();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          navigate("FaceQRScreen");
          await connectDoorController();
          await getParticipants();
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ContexProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationTypeForReplace: "push",
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="FaceQRScreen"
            children={() => (
              <FaceQRScreen
                props={{
                  sendFacePhoto: sendFacePhoto,
                  isConnectedDevice: isConnectedDevice,
                  isConnectedServer: isConnectedServer,
                  participants: participants,
                }}
              />
            )}
          />
          <Stack.Screen
            name="PasswordScreen"
            children={() => (
              <PasswordScreen
                props={{
                  isConnectedDevice: isConnectedDevice,
                  isConnectedServer: isConnectedServer,
                  participants: participants,
                }}
              />
            )}
          />
          <Stack.Screen
            name="ConfigScreen"
            children={() => (
              <ConfigScreen
                props={{
                  getParticipants: getParticipants,
                }}
              />
            )}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Footer getParticipants={getParticipants} />
    </ContexProvider>
  );
}
