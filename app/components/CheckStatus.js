import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, AppState } from "react-native";
import * as SecureStore from "expo-secure-store";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";
import { connectBLE } from "../utils/connectBLE";
import { useFocusEffect } from "@react-navigation/native";

export default function ServerStatus(props) {
  const { requestPermissions, connectBLEDevice, connectedDevice } =
    connectBLE();
  const [participants, setParticipants] = useState([]);
  const appState = useRef(AppState.currentState);
  const [isServerError, setIsServerError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // check door and server status on switch screen
      ConnectDoorController();
      GetUserList();
      const subscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
          ) {
            // check door and server status on awake
            ConnectDoorController();
            GetUserList();
          }
          appState.current = nextAppState;
        }
      );

      return () => {
        subscription.remove();
      };
    }, [])
  );

  async function ConnectDoorController() {
    if (connectedDevice != null) {
      return;
    }
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      connectBLEDevice();
    }
  }

  async function GetUserList() {
    // get allowed users user list
    console.log("call get user list Api");
    // if error or not
    setIsServerError(true);
    props.onServerError(true);
    // await StoreData("participants", ["1111", "2222"]);
    // await RetrieveData("participants");
  }

  async function StoreData(key, value) {
    const jsonValue = JSON.stringify(value);
    await SecureStore.setItemAsync(key, jsonValue).catch((error) =>
      console.log(error)
    );
  }

  async function RetrieveData(key) {
    await SecureStore.getItemAsync(key)
      .then((value) => {
        console.log(value);
        if (value != null) {
          setParticipants(JSON.parse(value));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function warningStatusUI(statusText) {
    return (
      <View style={styles.statusContainer}>
        <Image
          style={styles.warningIcon}
          source={require("../assets/warning-icon.png")}
        />
        <Text style={styles.warningText}>{statusText}</Text>
      </View>
    );
  }

  function errorStatusUI(statusText) {
    return (
      <View style={styles.statusContainer}>
        <Image
          style={styles.warningIcon}
          source={require("../assets/error-icon.png")}
        />
        <Text style={styles.errorText}>{statusText}</Text>
      </View>
    );
  }

  return (
    <>
      {!connectedDevice && (
        <>{errorStatusUI("Can't connect door controller")}</>
      )}
      {isServerError && (
        <>
          {warningStatusUI("Can't connect to the server")}
          {warningStatusUI("User permission may not in sync")}
          {warningStatusUI("Only QR Code and password are available")}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 2,
  },
  warningIcon: {
    resizeMode: "contain",
    height: 20,
    width: 20,
  },
  warningText: {
    color: colors.yellow,
    fontWeight: "600",
    fontSize: normalize(2),
  },
  errorText: {
    color: colors.red,
    fontWeight: "600",
    fontSize: normalize(2),
  },
});
