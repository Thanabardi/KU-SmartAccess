import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";

const DOOR_CONTROLLER_DEVICE_ID = "";
const DOOR_CONTROLLER_UUID = "1E200001-B4A5-F678-E9A0-E12E34DCCA5E";
const DOOR_CONTROLLER_CHARACTERISTIC = "1E200003-B4A5-F678-E9A0-E12E34DCCA5E";

export function connectBLE() {
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

  // function isDuplicateDevice(devices, nextDevice){
  //   return devices.findIndex(device => nextDevice.id === device.id) > -1;
  // } 

  // function scanForPeripherals(){
  //   bleManager.startDeviceScan(null, null, (error, device) => {
  //     if (error) {
  //       console.log(error)
  //     }
  //     if (device && device.name?.includes("DoorController")){
  //       setAllDevices((prevState) => {
  //         if (!isDuplicateDevice(prevState, device)){
  //             return [...prevState, device]
  //         }
  //         return prevState
  //       })
  //     }
  //   })
  // }

  async function connectBLEDevice(bleManager, isConnect) {
    setIsConnected(isConnect)
    if (!isConnected){
      bleManager.startDeviceScan(null, null, (error, device) => {
        console.log("Scaning... " + device);

        if (error) {
          console.log(error.message);
        }

        if (device?.name ==='DoorController') {
          console.log("Starting connection with DoorController");
          bleManager.stopDeviceScan();

          bleManager.connectToDevice(device.id, {autoConnect:true})
            .then(async (device) => {
              console.log(device.name)
              console.log("Discovering services and characteristics");
              setIsConnected(true);
              setConnectedDevice(device.name)
              // console.log(device)
              await device.discoverAllServicesAndCharacteristics()
              // await device.discoverAllServicesAndCharacteristics();
              const services = await device.services();
              services.forEach(async service => {
                const characteristics = await device.characteristicsForService(service.uuid);
                // console.log(characteristics)
                // characteristics.forEach(console.log);
              });
              // await readCharacteristicForService(device)
              // await writeCharacteristicForService(device)
              // console.log(await getServicesAndCharacteristics(device))
              device.onDisconnected((error, disconnectedDevice) => {
                console.log('Disconnected ', disconnectedDevice.name);
                setIsConnected(false)
              return device
            });      
            })
            .catch((error) => {
              console.log(error.message)
            })
        }
        });
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

  async function readCharacteristicForService(device){
    await device.readCharacteristicForService('1E200001-B4A5-F678-E9A0-E12E34DCCA5E', '1E200003-B4A5-F678-E9A0-E12E34DCCA5E')
    .then(valenc => {
      console.log(base64.decode(valenc?.value));
      setReadValue(base64.decode(valenc?.value))
    });
  }

  async function writeCharacteristicForService(device){
    await device.writeCharacteristicWithResponseForService('1E200001-B4A5-F678-E9A0-E12E34DCCA5E', '1E200002-B4A5-F678-E9A0-E12E34DCCA5E', 'aGVsbG8gbWlzcyB0YXBweQ==')
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
    // blueToothState,
    // scanForPeripherals,
  };
}
