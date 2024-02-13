import { useState } from "react";
import { Alert } from "react-native";

import { connectBLE } from "./connectBLE";
import axios from "axios";
import { retrieveData } from "./saveLoadData";
import { navigate } from "./rootNavigation";

export function serverConnection() {
  let accessToken = "";
  const [isConnectedDevice, setIsConnectedDevice] = useState(false);
  const [isConnectedServer, setIsConnectedServer] = useState(false);
  const [participants, setParticipants] = useState([]);
  const { requestPermissions, connectBLEDevice, connectedDevice } =
    connectBLE();

  async function connectDoorController() {
    setIsConnectedDevice(connectedDevice != null);
    if (connectedDevice != null) {
      return;
    }
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      connectBLEDevice();
    }
  }

  async function getToken(callback) {
    const appConfig = await getConfigData();
    if (appConfig == null) {
      return;
    }
    return await axios
      .post(appConfig.tokenAPI, {
        username: appConfig.kuUsername,
        password: appConfig.kuPassword,
      })
      .then((res) => {
        console.log(res.data);
        accessToken = res.data.access;
        callback?.call();
        setIsConnectedServer(true);
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Can't get token from the server", err.message, [
          { text: "OK" },
        ]);
        setIsConnectedServer(false);
      });
  }

  async function getParticipants() {
    // get allowed users user list
    const appConfig = await getConfigData();
    if (appConfig == null) {
      return;
    }
    return await axios
      .get(appConfig.participantsAPI, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-API-Key": appConfig.UUID,
        },
      })
      .then((res) => {
        console.log(res.data);
        setParticipants(res.data.participants);
        setIsConnectedServer(true);
      })
      .catch((err) => {
        if (err.response.status == 401) {
          getToken(function () {
            getParticipants();
          });
        } else {
          console.log(err);
          Alert.alert("Can't get patticipants", err.message, [{ text: "OK" }]);
          setIsConnectedServer(false);
        }
      });
  }

  async function sendFacePhoto(photo) {
    const appConfig = await getConfigData();
    if (appConfig == null) {
      return;
    }
    return await axios
      .post(
        appConfig.faceRecogAPI,
        {
          file: photo,
          single: true,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-API-Key": appConfig.UUID,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        return response.data.match;
      })
      .catch((err) => {
        if (err.response.status == 401) {
          getToken(function () {
            sendFacePhoto(photo);
          });
        } else {
          console.error(err);
          Alert.alert("Failed to upload image", err.message, [{ text: "OK" }]);
          setIsConnectedServer(false);
        }
      });
  }

  async function getConfigData() {
    const appConfig = await retrieveData("config");
    if (appConfig == null) {
      setIsConnectedServer(false);
      navigate("ConfigScreen");
    }
    return appConfig;
  }

  return {
    connectDoorController,
    getParticipants,
    sendFacePhoto,
    isConnectedDevice,
    isConnectedServer,
    participants,
  };
}
