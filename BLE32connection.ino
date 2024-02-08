#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic;
BLECharacteristic *pRxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;
int txValue = 0;

#define SERVICE_UUID "1E200001-B4A5-F678-E9A0-E12E34DCCA5E"
#define CHARACTERISTIC_UUID_RX "1E200002-B4A5-F678-E9A0-E12E34DCCA5E"
#define CHARACTERISTIC_UUID_TX "1E200003-B4A5-F678-E9A0-E12E34DCCA5E"

BLECharacteristic doorCharacteristic(
    BLEUUID((uint16_t)0x2A6E),
    BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_NOTIFY |
        BLECharacteristic::PROPERTY_WRITE
);

BLECharacteristic clientCharacteristic(
    BLEUUID((uint16_t)0x2A6E),
    BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_NOTIFY |
        BLECharacteristic::PROPERTY_WRITE
);

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
    Serial.println("Disconnected from central device");
  }
};

void checkToReconnect() {
  // disconnected so advertise
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // give the Bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    Serial.println("Disconnected: start advertising");
    oldDeviceConnected = deviceConnected;
  }
  // connected so reset boolean control
  if (deviceConnected && !oldDeviceConnected) {
    // do stuff here on connecting
    Serial.println("Reconnected");
    oldDeviceConnected = deviceConnected;
  }
}

void setup() {
  Serial.begin(9600);

  BLEDevice::init("DoorController");

  // create server
  pServer = BLEDevice::createServer(); // Use the global pServer
  pServer->setCallbacks(new MyServerCallbacks());

  // create the BLE service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // create a BLE characteristic
  pCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID_TX,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_WRITE
  );
  pService->addCharacteristic(&doorCharacteristic);

  // BLE2902 needed to notify
  doorCharacteristic.addDescriptor(new BLE2902());

  // receive notify
  pRxCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID_RX,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_WRITE
  );

  pServer->getAdvertising()->addServiceUUID(pService->getUUID());

  // start service
  pService->start();

  // start advertising
  pServer->getAdvertising()->start();
  Serial.println("Waiting for a client connection to notify");
}

void loop() {
  checkToReconnect();

  if (deviceConnected) {
    txValue = random(-10, 20);

    // Conversion of txValue
    char txString[8];
    dtostrf(txValue, 1, 2, txString);

    // set value to characteristic
    pCharacteristic->setValue(txString);

    // notify
    pCharacteristic->notify();
    Serial.println("Send value: " + String(txString) + "\n");
    Serial.println("Device: " + String(deviceConnected) + "\n");

    // read message
    std::string value = pRxCharacteristic->getValue().c_str();
    if (!value.empty()) {
      Serial.print("Received: " + String(value.c_str()));
    }

    delay(500);
  }
}
