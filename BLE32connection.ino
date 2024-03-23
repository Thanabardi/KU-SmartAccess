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

#define MAX_BUFFER_SIZE 100
#define MAX_STRING_LENGTH 20
#define SERVICE_UUID "1E200001-B4A5-F678-E9A0-E12E34DCCA5E"
#define CHARACTERISTIC_UUID_RX "1E200002-B4A5-F678-E9A0-E12E34DCCA5E"
#define CHARACTERISTIC_UUID_TX "1E200003-B4A5-F678-E9A0-E12E34DCCA5E"

char fifoBuffer[MAX_BUFFER_SIZE][MAX_STRING_LENGTH];
int fifoHead = 0;
int fifoTail = 0;

const int lightSensorPin = A0; // Analog pin where the light sensor is connected
const int lightPin = 25;     // Pin to control based on light sensor reading
const int LIGHT_THRESHOLD = 175; // Adjust this value according to your requirements

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
    pServer->getAdvertising()->stop(); // Stop advertising when a device connects
  }

  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
    pServer->getAdvertising()->start(); // Start advertising when a device disconnects
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

void addToBuffer(const std::string& str) {
    if (((fifoTail + 1) % MAX_BUFFER_SIZE) != fifoHead) { // Check for buffer full
        str.copy(fifoBuffer[fifoTail], MAX_STRING_LENGTH);
        fifoTail = (fifoTail + 1) % MAX_BUFFER_SIZE;
    } else {
        // Handle buffer overflow
        Serial.println("Buffer overflow!");
    }
}

std::string removeFromBuffer() {
    std::string str;
    if (fifoHead != fifoTail) { // Check for buffer empty
        str = fifoBuffer[fifoHead];
        fifoHead = (fifoHead + 1) % MAX_BUFFER_SIZE;
    } else {
        // Handle buffer underflow
        Serial.println("Buffer underflow!");
    }
    return str;
}

void processBuffer() {
    while (fifoHead != fifoTail) {
        std::string str = removeFromBuffer();
        // Process the string
        Serial.print("Received: ");
        Serial.println(str.c_str());
    }
}

// Callback invoked when data is written to the BLE characteristic
class CharacteristicCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        std::string value = pCharacteristic->getValue();
        addToBuffer(value);
    }
};

// lux
float lux;                         // Variable to store lux value

float computeVin(int adc) {
    return (1.1 * adc) / 4095.0;
}

float computeRl(float v) {
    return v * 33000.0 / (3.3 - v);
}

float computeLux(float rl) {
    // from graph
    float result;
    if (rl == 0) {
        rl = 100; // Default value if rl is 0
    }
    result = 10000.0 / pow(((rl / 1000.0) * 10.0), (4.0 / 3.0));
    return result;
}

void setup() {
  Serial.begin(9600);
  delay(1000);

  //light
  pinMode(lightPin, OUTPUT); // Set USB presence pin as input with internal pull-up resistor

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

  // Set the callback for the characteristic
  pRxCharacteristic->setCallbacks(new CharacteristicCallbacks());

  pServer->getAdvertising()->addServiceUUID(pService->getUUID());

  // start service
  pService->start();

  // start advertising
  pServer->getAdvertising()->start();
  Serial.println("Waiting for a client connection to notify");
}

void loop() {
  checkToReconnect();
  // light   
  Serial.print("Light sensor value : ");
  int lightSensorValue = analogRead(lightSensorPin);

  // Convert sensor value to lux using linear equation
  float vin = computeVin(lightSensorValue);
  float rl = computeRl(vin);
  float lux = computeLux(rl);

  // Print lux value to Serial Monitor
  Serial.print("Lux value: ");
  Serial.println(lux);
  delay(1000);
    // Check if light is too low
  if (lux < LIGHT_THRESHOLD) {
    // Turn on port
    digitalWrite(lightPin, LOW);
    Serial.println("Light too low, port turned on.");
  } else {
    // Turn off port
    digitalWrite(lightPin, HIGH);
    Serial.println("Light level normal, port turned off.");
  }

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
    processBuffer();

    delay(500);
  }
}
