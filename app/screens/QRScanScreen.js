import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { Camera, CameraType } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

export default function QRScanScreen({ navigation }) {
  let cameraRef = useRef();
  const cameraType = CameraType.front;
  const [dt, setDt] = useState(new Date().toLocaleString());
  const [hasCameraPermission, setCameraPermission] = useState();
  const [faceDetected, setFaceDetected] = useState(false);
  const [photo, setPhoto] = useState(null);

  // use to setInterval without delay first
  function setIntervalImmediately(func, interval) {
    func();
    return setInterval(func, interval);
  }

  // keep update date time
  useEffect(() => {
    var timer = setIntervalImmediately(() => {
      const d = new Date().toString().split(" ");
      setDt([d[0] + " " + d[2] + " " + d[1] + " " + d[3], d[4]]);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  // check cameraPermission on startup
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraPermission.granted);
    })();
  }, []);

  // check face detection
  function checkForFace(obj) {
    try {
      if (!faceDetected && obj.faces.length > 0) {
        setFaceDetected(true);
        setTimeout(() => {
          takePic();
        }, 1000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function takePic() {
    const options = {
      quality: 1,
      base64: true,
      exif: false,
    };
    await cameraRef.current
      .takePictureAsync(options)
      .then((photo) => {
        setPhoto(photo);
        sendPhoto(photo);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function sendPhoto(photo) {
    console.log(photo.uri);

    setTimeout(() => {
      setFaceDetected(false);
    }, 1000);

    // await axios
    //   .post(
    //     `path`,
    //     {
    //       image: photo.uri,
    //       door: "1",
    //     },
    //     {
    //       headers: {
    //         "content-type": "multipart/form-data",
    //       },
    //     }
    //   )
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     setFaceDetected(false);
    //   });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>QR Code Scan</Text>
      </View>
      {/* for testing */}
      {photo && (
        <Image
          resizeMode="contain"
          source={{ uri: photo.uri }}
          style={{ flex: 4 }}
        />
      )}
      <View style={styles.imagePreview}>
        {!hasCameraPermission ? (
          <Text style={styles.cameraDenied}>
            Allow SmartAccess-Terminal to access camera
          </Text>
        ) : (
          <Camera
            ref={cameraRef}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            type={cameraType}
            onFacesDetected={(e) => checkForFace(e)}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.accurate,
              minDetectionInterval: 500,
              tracking: true,
            }}
          >
            <View style={styles.imageOverlay} />
          </Camera>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.faceID }]}
            onPress={() => navigation.navigate("FaceIDScreen")}
          >
            <Image
              resizeMode="contain"
              style={{ flex: 1 }}
              source={require("../assets/face-scan-icon.png")}
            />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Face ID Scan</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.pin }]}
            onPress={() => navigation.navigate("PinScreen")}
          >
            <Image
              resizeMode="contain"
              style={{ flex: 1 }}
              source={require("../assets/pin-icon.png")}
            />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Password</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{dt[1]}</Text>
        <Text style={styles.footerText}>{dt[0]}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flex: 2,
    backgroundColor: colors.QRScan,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: colors.white,
    fontSize: normalize(5),
    fontWeight: 600,
  },
  imagePreview: {
    flex: 8,
    backgroundColor: colors.black,
    borderRadius: 10,
    margin: normalize(3),
    marginBottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlay: {
    height: "60%",
    aspectRatio: 1 / 1,
    borderColor: "red",
    borderWidth: normalize(1),
    borderStyle: "dashed",
    borderRadius: normalize(3),
  },
  cameraDenied: {
    fontSize: normalize(2),
    color: colors.white,
  },
  buttonContainer: {
    flex: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    height: normalize(12),
    aspectRatio: 1 / 1,
    alignItems: "center",
    borderRadius: normalize(1.5),
    padding: 10,
  },
  buttonLabel: {
    fontSize: normalize(3),
    fontWeight: 500,
  },
  footer: {
    flex: 1,
    backgroundColor: colors.darkGray,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: colors.white,
    fontSize: normalize(3),
    fontWeight: 500,
    marginLeft: 20,
    marginRight: 20,
  },
});
