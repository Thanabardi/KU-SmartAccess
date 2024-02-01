import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FaceQRScreen from "./app/screens/FaceQRScreen";
import PasswordScreen from "./app/screens/PasswordScreen";
import Footer from "./app/components/Footer";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
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
    </>
  );
}
