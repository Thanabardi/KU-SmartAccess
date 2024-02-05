import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useState } from "react";
import axios from "axios";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

import Header from "../components/Header";
import Status from "../components/Status";

export default function PasswordScreen({ navigation }) {
  const [password, setPassword] = useState("");

  function onSubmit() {
    Alert.alert("Access Denied", "Incorrect Password", [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);
    console.log(password);
    setPassword("");
  }

  function inputFiledUI() {
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          onSubmitEditing={() => onSubmit()}
          value={password}
          placeholder="Password"
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => onSubmit()}
        >
          <Text style={styles.submitButtonLabel}>Confirm</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header
        navigation={navigation}
        linkAlignLeft={true}
        screenNavigate="FaceQRScreen"
        screenNavigateText="< Use Face and QR Code"
        Title="Password"
      />
      {inputFiledUI()}
      <Status />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
  },
  inputContainer: {
    width: "80%",
    height: "20%",
    backgroundColor: colors.gray,
    borderRadius: normalize(1.5),
    padding: 10,
    marginVertical: 20,
  },
  input: {
    flex: 1,
    fontSize: normalize(2.5),
    backgroundColor: colors.white,
    borderRadius: normalize(1.5),
    paddingHorizontal: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.blue,
    borderRadius: normalize(1.5),
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonLabel: {
    fontSize: normalize(3),
    fontWeight: "500",
    color: colors.white,
  },
});
