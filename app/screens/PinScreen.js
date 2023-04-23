import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

export default function PinScreen({ navigation }) {
  const [dt, setDt] = useState(new Date().toLocaleString());
  const [password, setPassword] = useState("");

  // use to setInterval without delay first
  function setIntervalImmediately(func, interval) {
    func();
    return setInterval(func, interval);
  }

  // keep update date time
  useEffect(() => {
    var timer = setIntervalImmediately(() => {
      const d = new Date().toString().split(" ");
      setDt([d[0] + " " + d[2] + " " + d[1] + " " + d[3], d[4]]);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  function onSubmit() {
    Alert.alert("Error", "Incorrect Password", [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);
    setPassword("");
    console.log(password);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Password</Text>
      </View>
      {/* <View style={styles.inputField}></View> */}
      <View style={{ flex: 8, justifyContent: "center" }}>
        <View style={styles.input}>
          <TextInput
            style={styles.inputField}
            onChangeText={setPassword}
            onSubmitEditing={() => onSubmit()}
            value={password}
            placeholder="Password"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => onSubmit()}
          >
            <Text style={styles.buttonLabel}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.QRScan }]}
            onPress={() => navigation.navigate("QRScanScreen")}
          >
            <Image
              resizeMode="contain"
              style={{ flex: 1 }}
              source={require("../assets/QR-scan-icon.png")}
            />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>QR Code Scan</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.faceID }]}
            onPress={() => navigation.navigate("FaceIDScreen")}
          >
            <Image
              resizeMode="contain"
              style={{ flex: 1 }}
              source={require("../assets/face-scan-icon.png")}
            />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Face ID Scan</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{dt[1]}</Text>
        <Text style={styles.footerText}>{dt[0]}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flex: 2,
    backgroundColor: colors.pin,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: colors.white,
    fontSize: normalize(5),
    fontWeight: 600,
  },
  input: {
    height: "45%",
    backgroundColor: colors.gray,
    borderRadius: normalize(1.5),
    padding: 10,
    margin: normalize(3),
    alignItems: "center",
    justifyContent: "center",
  },
  inputField: {
    flex: 1,
    fontSize: normalize(2.5),
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: normalize(1.5),
    paddingHorizontal: 10,
    marginBottom: normalize(1),
  },
  submitButton: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.pin,
    borderRadius: normalize(1.5),
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    height: normalize(12),
    aspectRatio: 1 / 1,
    alignItems: "center",
    borderRadius: normalize(1.5),
    padding: 10,
  },
  buttonLabel: {
    fontSize: normalize(3),
    fontWeight: 500,
  },
  footer: {
    flex: 1,
    backgroundColor: colors.darkGray,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: colors.white,
    fontSize: normalize(3),
    fontWeight: 500,
    marginLeft: 20,
    marginRight: 20,
  },
});
