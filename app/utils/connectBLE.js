import { useState, useMemo } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import BackgroundService from 'react-native-background-actions';
import { BleManager } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";

const DOOR_CONTROLLER_DEVICE_ID = "";
const DOOR_CONTROLLER_UUID = "1E200001-B4A5-F678-E9A0-E12E34DCCA5E";
const DOOR_CONTROLLER_CHARACTERISTIC = "1E200003-B4A5-F678-E9A0-E12E34DCCA5E";

export function connectBLE() {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [readValue, setReadValue] = useState(null);

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

  async function connectBLEDevice(isConnect) {
    const task = async () => {
      await new Promise(async () => {
        setIsConnected(isConnect)
        if (!isConnected) {
          bleManager.startDeviceScan(null, null, (error, device) => {
            console.log("Scaning... " + device);

            if (error) {
              console.log(error.message);
            }

            if (device?.name === 'DoorController') {
              console.log("Starting connection with DoorController");
              bleManager.stopDeviceScan();

              bleManager.connectToDevice(device.id, { autoConnect: true })
                .then(async (device) => {
                  console.log(device.name)
                  console.log("Discovering services and characteristics");
                  setIsConnected(true);

                  await device.discoverAllServicesAndCharacteristics()
                  const services = await device.services();
                  services.forEach(async service => {
                    const characteristics = await device.characteristicsForService(service.uuid);
                    // console.log(characteristics)
                    // characteristics.forEach(console.log);
                  });

                  // set connected Device
                  setConnectedDevice(await device);

                  device.onDisconnected(async (error, disconnectedDevice) => {
                    console.log('Disconnected from device');
                    setConnectedDevice(null)
                    setIsConnected(false)
                  });
                  return device
                })
                .catch((error) => {
                  console.log(error.message)
                })
            }
          });
        }
      })
    }
    const options = {
      taskName: 'BLE_Task',
      taskTitle: 'BLE Background Task',
      taskDesc: 'Connecting to BLE device in the background',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ffffff',
    };
    await BackgroundService.start(task, options);

    return Promise.resolve();
  }

  async function disconnectBLEDevice() {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
    }
  }

  async function startStreamingData() {
    if (connectedDevice) {
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
      console.error(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No data received from device");
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    console.log(rawData);
  }

  async function readCharacteristicForService(connectedDevice) {
    await connectedDevice.readCharacteristicForService('1E200001-B4A5-F678-E9A0-E12E34DCCA5E', '1E200003-B4A5-F678-E9A0-E12E34DCCA5E')
      .then(valenc => {
        console.log(base64.decode(valenc?.value));
        setReadValue(base64.decode(valenc?.value))
      });
  }

  async function writeCharacteristicForService(connectedDevice, message) {
    if (!connectedDevice) {
      return;
    }
    await connectedDevice.writeCharacteristicWithResponseForService('1E200001-B4A5-F678-E9A0-E12E34DCCA5E', '1E200002-B4A5-F678-E9A0-E12E34DCCA5E', base64.encode(message))
      .then((characteristic) => {
        console.log("Write message: ", characteristic.value);
      })
  }

  return {
    requestPermissions,
    connectBLEDevice,
    connectedDevice,
    readCharacteristicForService,
    writeCharacteristicForService,
  };
}
