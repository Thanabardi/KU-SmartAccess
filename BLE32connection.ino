#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Adafruit_NeoPixel.h>


BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic;
BLECharacteristic *pRxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;
bool advertisingState = false;
const int BUTTON_PIN = 16;
int txValue = 0;

#define MAX_BUFFER_SIZE 100
#define MAX_STRING_LENGTH 20
#define SERVICE_UUID "1E200001-B4A5-F678-E9A0-E12E34DCCA5E"
#define CHARACTERISTIC_UUID_RX "1E200002-B4A5-F678-E9A0-E12E34DCCA5E"
#define CHARACTERISTIC_UUID_TX "1E200003-B4A5-F678-E9A0-E12E34DCCA5E"

char fifoBuffer[MAX_BUFFER_SIZE][MAX_STRING_LENGTH];
int fifoHead = 0;
int fifoTail = 0;

// const int lightSensorPin = A0; // Analog pin where the light sensor is connected
// const int lightPin = 25;     // Pin to control based on light sensor reading
const int LIGHT_THRESHOLD = 175; // Adjust this value according to your requirements
#define LIGHT_SENSOR_PIN 34  // GPIO 26

// // Define the pin for the RGB LED
#define RGB_PIN   27  // GPIO 27
#define NUM_LEDS   12  // Number of LEDs in your ZX-RGB12R strip

// // Create an array of CRGB objects to represent the LEDs
// CRGB leds[NUM_LEDS];
Adafruit_NeoPixel ring(NUM_LEDS, RGB_PIN, NEO_GRB + NEO_KHZ800);

#define IS_LOCK_PIN 32
#define DOOR_BUTTON_PIN 33
#define UNLOCK_DOOR_PIN 26
#define DISTANCE_PIN 35  // GPIO 35


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
    if (!advertisingState) {
      pServer->getAdvertising()->stop(); // Stop advertising when a device connects if advertising state is off
    }
  }

  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
    if (!advertisingState) {
      pServer->getAdvertising()->start(); // Start advertising when a device disconnects if advertising state is off
    }
    Serial.println("Disconnected from central device");
  }
};

void checkToReconnect() {
    static bool lastButtonState = true; // Initial state assumed to be not pressed
    bool buttonState = digitalRead(BUTTON_PIN);

    if (buttonState != lastButtonState) {
        delay(50); // Debounce delay
        if (buttonState == LOW) { // Button pressed
            advertisingState = !advertisingState; // Toggle advertising state
            if (advertisingState) {
                pServer->getAdvertising()->start(); // Start advertising
                Serial.println("Bluetooth sharing started");
            } else {
                pServer->getAdvertising()->stop(); // Stop advertising
                Serial.println("Bluetooth sharing stopped");
            }
        }
    }
    lastButtonState = buttonState;

    // disconnected so advertise
    if (!deviceConnected && oldDeviceConnected) {
        delay(500); // Give the Bluetooth stack the chance to get things ready
        if (!advertisingState) {
            pServer->startAdvertising(); // Restart advertising only if the button is not pressed
        }
        Serial.println("Disconnected from device");
        oldDeviceConnected = deviceConnected;
    }

    // connected so stop advertising
    if (deviceConnected && !oldDeviceConnected) {
        if (advertisingState) {
            pServer->getAdvertising()->stop(); // Stop advertising
            Serial.println("Bluetooth sharing stopped");
            advertisingState = false;
        }
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

void led_open(int r, int g, int b) {
  for(int i = 0; i < ring.numPixels(); i++){
    ring.setPixelColor(i, r, g, b, 0);
  }
  ring.show(); // Update LEDs with new colors
}

void setup() {
  Serial.begin(9600);
  delay(1000);

  //light
  // pinMode(lightPin, OUTPUT); // Set USB presence pin as input with internal pull-up resistor
  pinMode(BUTTON_PIN, INPUT_PULLUP); // Assuming the switch is connected to GND when pressed
  pinMode(DOOR_BUTTON_PIN, INPUT_PULLUP);
  pinMode(UNLOCK_DOOR_PIN, OUTPUT);
  // FastLED.addLeds<WS2812,RGB_PIN,GRB>(leds, NUM_LEDS);
  ring.begin();           
  ring.show();            
  ring.setBrightness(50); 
  if (ring.numPixels() > 0) {
    Serial.println("LED strip is connected.");
  } else {
    Serial.println("LED strip is not connected. Please check your connections.");
  }
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
  
  // Start advertising if the switch is pressed
  Serial.println("Finish setup: Waiting for a client connection to notify");
}

void loop() {
  checkToReconnect();
  // light   
  // int lightSensorValue = analogRead(lightSensorPin);

  // Convert sensor value to lux using linear equation

  // Print lux value to Serial Monitor
  // Serial.print("Lux value: ");
  int lightValue = analogRead(LIGHT_SENSOR_PIN);
  Serial.print("Light value: ");
  Serial.println(lightValue);
  delay(1000);

  int distanceValue = analogRead(DISTANCE_PIN);
  Serial.print("Distance value: ");
  Serial.println(distanceValue);

  int isLock = analogRead(IS_LOCK_PIN);
  Serial.print("isLock value: ");
  Serial.println(isLock);

  int buttonDoorCheck = analogRead(DOOR_BUTTON_PIN);
  bool buttonDoor = digitalRead(DOOR_BUTTON_PIN);
  Serial.print("button_door value: ");
  Serial.println(buttonDoorCheck);
  Serial.print("button_door bool: ");
  Serial.println(buttonDoor);

  int readDoorUnlock = analogRead(UNLOCK_DOOR_PIN);
  Serial.print("readDoorUnlock value: ");
  Serial.println(readDoorUnlock);
  // Unlock door
  if (buttonDoorCheck == 0 && isLock == 0){
    Serial.println("Unlock door");
    digitalWrite(UNLOCK_DOOR_PIN, LOW);
    delay(5000);
    digitalWrite(UNLOCK_DOOR_PIN, HIGH);
  }

  // Update NeoPixel LED strip colors
  if (lightValue < LIGHT_THRESHOLD) {
    led_open(255, 255, 255);
    Serial.println("Light too low, port turned on.");
  } else {
    led_open(0, 0, 0);
    Serial.println("Light level normal, port turned off.");
  }

  delay(1000);  // Wait for 1 second

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

    // read message
    processBuffer();

    delay(500);
  }
}
