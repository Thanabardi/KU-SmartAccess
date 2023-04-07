import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FaceIDScreen from "./app/screens/FaceIDScreen";
import QRScanScreen from "./app/screens/QRScanScreen";
import PinScreen from "./app/screens/PinScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="FaceIDScreen" component={FaceIDScreen} />
        <Stack.Screen name="QRScanScreen" component={QRScanScreen} />
        <Stack.Screen name="PinScreen" component={PinScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
