# include <BLEDevice.h>
# include <BLESERVER.h>
# include <BLEUtils.h>
# include <BLE2902.h>

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;
int txValue = 0;

#define SERVICE_UUID "1E200001-B4A5-F678-E9A0-E12E34DCCA5E"
#define CHARACTERISTIC_UUID_TX "1E200003-B4A5-F678-E9A0-E12E34DCCA5E"

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer){
    deviceConnected = true;
  };

    void onDisconnected(BLEServer* pServer){
      deviceConnected = false;
  };
};

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  BLEDevice::init("ESP32");

  // create server
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // create the BLE servioce
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // create a ble characteristic
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY
  );

  // ble2902 needed to notify
  pCharacteristic->addDescriptor(new BLE2902());

  // start service
  pService->start();

  // start advertising
  pServer->getAdvertising()->start();
  Serial.println("Waiting for a client connection to notify");
}

void loop() {
  // put your main code here, to run repeatedly:
  if (deviceConnected){
    txValue = random(-10, 20);

    //Conversion of txValue
    char txString[8];
    dtostrf(txValue, 1, 2, txString);

    // set value to characteristic
    pCharacteristic->setValue(txString);

    // notify
    pCharacteristic->notify();
    Serial.println("Send value: " + String(txString));
    delay(500);
  }
}
