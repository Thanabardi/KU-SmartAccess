import { useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";

import { connectBLE } from "../utils/connectBLE";
import { useAppContext } from "../contex/AppContex";
import { retrieveData, storeData } from "../utils/saveLoadData";
import axios from "axios";

export default function ConnectionStatus() {
  const { contexMethods } = useAppContext();
  const [accessToken, setAccessToken] = useState();
  const [appConfig, setAppConfig] = useState();
  const { requestPermissions, connectBLEDevice, connectedDevice } =
    connectBLE();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          setAppConfig(await retrieveData("config"));
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (appConfig == null) {
      return;
    }
    // check door and server status
    async function fecthData() {
      await connectDoorController();
      await getToken();
    }
    fecthData();
  }, [appConfig]);

  useEffect(() => {
    if (accessToken == null) {
      return;
    }
    async function fecthData() {
      await getUserList();
    }
    fecthData();
  }, [accessToken]);

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

  async function getToken() {
    return await axios
      .post(appConfig.tokenAPI, {
        username: appConfig.kuUsername,
        password: appConfig.kuPassword,
      })
      .then((res) => {
        console.log(res.data);
        storeData("accessToken", res.data.access);
        setAccessToken(res.data.access);
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Can't get token from the server", err.message, [
          { text: "OK" },
        ]);
      });
  }

  async function getUserList() {
    // get allowed users user list
    return await axios
      .get(appConfig.participantsAPI, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-API-Key": appConfig.UUID,
        },
      })
      .then((res) => {
        console.log(res.data);
        storeData("participants", res.data.participants);
        contexMethods.addOrReplaceContex("isConnectedServer", true);
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Can't get patticipants", err.message, [{ text: "OK" }]);
        contexMethods.addOrReplaceContex("isConnectedServer", false);
      });
  }
}
