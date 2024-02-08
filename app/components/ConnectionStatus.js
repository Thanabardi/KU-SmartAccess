import { useMemo, useEffect, useRef, useState, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";

import { connectBLE } from "../utils/connectBLE";
import { useAppContext } from "../contex/AppContex";
import { BleManager } from "react-native-ble-plx"
import { DeviceContext } from "../../App"

export default function ConnectionStatus() {
  var isConnect;
  const { contexMethods } = useAppContext();
  const { requestPermissions, connectBLEDevice, connectedDevice, readValue, readCharacteristicForService } = connectBLE();
  const [participants, setParticipants] = useState([]);
  const appState = useRef(AppState.currentState);
  const bleManager = useMemo(() => new BleManager(), []);
  const [bleState, setBleState] = useState();
  const [device, setDevice] = useContext(DeviceContext)

  useEffect(() => {
    bleManager.onStateChange((state) => {
      setBleState(state)
      if (state === 'PoweredOff'){
        isConnect = false
      } else if (state == 'PoweredOn') {
        setDevice(connectDoorController(bleManager, isConnect));
      }
    })

    console.log("state: ", bleState)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // check door and server status on awake
        setDevice(connectDoorController(bleManager, isConnect));
        getUserList();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [bleState, readValue]);

  async function connectDoorController(bleManager, isConnect) {
    contexMethods.addOrReplaceContex(
      "isConnectedDevice",
      connectedDevice != null
    );
    if (connectedDevice != null) {
      return;
    }
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      return connectBLEDevice(bleManager, isConnect);
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
