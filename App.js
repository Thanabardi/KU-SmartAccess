import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FaceQRScreen from "./app/screens/FaceQRScreen";
import PasswordScreen from "./app/screens/PasswordScreen";
import Footer from "./app/components/Footer";
import ConfigScreen from "./app/screens/ConfigScreen";
import { navigationRef, navigate } from "./app/utils/rootNavigation";
import { serverConnection } from "./app/utils/serverConnection";
import { useEffect, useRef, useMemo } from "react";
import { AppState } from "react-native";
import { BleManager } from "react-native-ble-plx";

const Stack = createNativeStackNavigator();

export default function App() {
  const appState = useRef(AppState.currentState);
  const bleManager = useMemo(() => new BleManager(), []);

  const {
    connectDoorController,
    getParticipants,
    sendFacePhoto,
    connectedDevice,
    isConnectedDevice,
    isConnectedServer,
    participants,
  } = serverConnection();

  useEffect(() => {
    bleManager.onStateChange((state) => {
      if (state === 'PoweredOff') {
      } else if (state == 'PoweredOn') {
        connectDoorController();
      }
    })

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
    <>
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
                  device: connectedDevice,
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
                  device: connectedDevice,
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
    </>
  );
}
