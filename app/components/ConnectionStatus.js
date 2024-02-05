import { useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";

import { connectBLE } from "../utils/connectBLE";
import { useAppContext } from "../contex/AppContex";

export default function ConnectionStatus() {
  const { contexMethods } = useAppContext();
  const { requestPermissions, connectBLEDevice, connectedDevice } = connectBLE();
  const [participants, setParticipants] = useState([]);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // check door and server status on awake
        connectDoorController();
        getUserList();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function connectDoorController() {
    contexMethods.addOrReplaceContex(
      "isConnectedDevice",
      connectedDevice != null
    );
    if (connectedDevice != null) {
      return;
    }
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      connectBLEDevice();
    }
  }

  async function getUserList() {
    // get allowed users user list
    console.log("call get user list Api");
    // if error or not
    contexMethods.addOrReplaceContex("isConnectedServer", true);
    // await StoreData("participants", ["1111", "2222"]);
    // await RetrieveData("participants");
  }

  async function storeData(key, value) {
    const jsonValue = JSON.stringify(value);
    await SecureStore.setItemAsync(key, jsonValue).catch((error) =>
      console.error(error)
    );
  }

  async function retrieveData(key) {
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
}
