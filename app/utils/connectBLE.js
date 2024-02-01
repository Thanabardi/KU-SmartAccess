import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";

const DOOR_CONTROLLER_DEVICE_ID = "";
const DOOR_CONTROLLER_UUID = "";
const DOOR_CONTROLLER_CHARACTERISTIC = "";

export function connectBLE() {
  const bleManager = useMemo(() => new BleManager(), []);
  const [connectedDevice, setConnectedDevice] = useState(null);

  async function requestAndroid31Permissions() {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Scan Permission",
        message: "Allow SmartAccess-Terminal to scan BLE device",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Connect Permission",
        message: "Allow SmartAccess-Terminal to connect BLE device",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Allow SmartAccess-Terminal to find BLE device",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  }

  async function requestPermissions() {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Allow SmartAccess-Terminal to find BLE device",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return await requestAndroid31Permissions();
      }
    } else {
      return true;
    }
  }

  async function connectBLEDevice() {
    try {
      const deviceConnection = await bleManager.connectToDevice(
        DOOR_CONTROLLER_DEVICE_ID
      );
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      startStreamingData(deviceConnection);
    } catch (error) {
      console.log("Failed to connect BLE device", error);
    }
  }

  function disconnectBLEDevice() {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  }

  async function startStreamingData(device) {
    if (device) {
      device.monitorCharacteristicForService(
        DOOR_CONTROLLER_UUID,
        DOOR_CONTROLLER_CHARACTERISTIC,
        onEventTrigger
      );
    } else {
      console.log("No device connected");
    }
  }

  function onEventTrigger(error, characteristic) {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No data received from device");
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    console.log(rawData);
  }

  return {
    requestPermissions,
    connectBLEDevice,
    connectedDevice,
  };
}
