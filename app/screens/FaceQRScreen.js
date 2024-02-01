import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { useIsFocused } from "@react-navigation/native";

import { Camera, CameraType } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

import Header from "../components/Header";
import CheckStatus from "../components/CheckStatus";

export default function FaceIDScreen({ navigation }) {
  let cameraRef = useRef();
  const statusColor = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const cameraType = CameraType.front;

  const [progressText, setProgressText] = useState();
  const [isServerError, setIsServerError] = useState(false);
  const [hasCameraPermission, setCameraPermission] = useState();
  const [hastakePhoto, setHasTakePhoto] = useState(false);
  const [photo, setPhoto] = useState(null);

  // useEffect(() => {
  //   Animated.timing(statusColor, {
  //     duration: 1000,
  //     toValue: 1,
  //     useNativeDriver: true,
  //   }).start();
  // }, []);

  // check cameraPermission on startup
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraPermission.granted);
    })();
  }, []);

  async function takePic(pic) {
    if (!hastakePhoto && pic.faces.length > 0) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };
      try {
        await cameraRef.current
          .takePictureAsync(options)
          .then((photo) => {
            setHasTakePhoto(true);
            setPhoto(photo);
            sendPhoto(photo);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function sendPhoto(photo) {
    console.log(photo.uri);

    // for testing
    setTimeout(() => {
      setHasTakePhoto(false);
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
    //     setTakePhoto(false);
    //   });
  }

  function CameraPreviewUI() {
    return (
      <View style={styles.cameraContainer}>
        {!hasCameraPermission ? (
          <Text style={styles.cameraDenied}>
            Allow SmartAccess-Terminal to access camera
          </Text>
        ) : (
          isFocused && (
            <Camera
              ref={cameraRef}
              type={cameraType}
              style={styles.camera}
              ratio="1:1"
              onFacesDetected={(e) => takePic(e)}
              faceDetectorSettings={{
                mode: FaceDetector.FaceDetectorMode.accurate,
                minDetectionInterval: 500,
                runClassifications:
                  FaceDetector.FaceDetectorClassifications.all,
              }}
            >
              <Image
                style={styles.cameraOverlay}
                source={
                  isServerError
                    ? require("../assets/qr-outline.png")
                    : require("../assets/face-qr-outline.png")
                }
              />
            </Camera>
          )
        )}
      </View>
    );
  }

  function ProgressUI() {
    return (
      <>
        <Text style={styles.progressText}>
          Move your head or verification QR Code toward the camera
        </Text>
        <Text style={styles.progressText}>Hold Still</Text>
        <Text style={styles.progressText}>Verifying...</Text>
      </>
    );
  }

  function ResultUI() {
    return (
      <Animated.View
        style={[
          styles.statusColor,
          { opacity: statusColor, backgroundColor: colors.blue },
        ]}
      />
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header
        navigation={navigation}
        linkAlignLeft={false}
        screenNavigate="PasswordScreen"
        screenNavigateText="Use Password >"
        Title="Face & QR Code"
      />
      {CameraPreviewUI()}
      <CheckStatus onServerError={setIsServerError} />
      <Text style={styles.progressText}>{progressText}</Text>
      {/* {ResultUI()} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
  },
  cameraContainer: {
    backgroundColor: colors.black,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    width: "80%",
    aspectRatio: 1 / 1,
  },
  cameraDenied: {
    fontSize: normalize(2),
    color: colors.white,
  },
  camera: {
    resizeMode: "cover",
    width: "95%",
    height: "95%",
  },
  cameraOverlay: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  progressText: {
    color: colors.black,
    fontWeight: "600",
    fontSize: normalize(2),
    textAlign: "center",
    margin: normalize(4),
  },
  statusColor: {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 5,
  },
});
