import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Alert,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { manipulateAsync } from "expo-image-manipulator";
import axios from "axios";

import { useFocusEffect, useIsFocused } from "@react-navigation/native";

import { Camera, CameraType } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

import Header from "../components/Header";
import Status from "../components/Status";
import { useAppContext } from "../contex/AppContex";
import { retrieveData } from "../utils/saveLoadData";

export default function FaceIDScreen({ navigation }) {
  const { appContex } = useAppContext();
  let cameraRef = useRef();
  const resultColor = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const cameraType = CameraType.front;

  const [appConfig, setAppConfig] = useState();
  const [accessToken, setAccessToken] = useState();
  const [progressText, setProgressText] = useState(
    "Move your head or verification QR Code toward the camera"
  );
  const [hasCameraPermission, setCameraPermission] = useState();
  const [hastakePhoto, setHasTakePhoto] = useState(false);

  // useEffect(() => {
  //   Animated.timing(statusColor, {
  //     duration: 1000,
  //     toValue: 1,
  //     useNativeDriver: true,
  //   }).start();
  // }, []);

  // check app setting
  useFocusEffect(
    useCallback(() => {
      async function getConfigData() {
        const config = await retrieveData("config");
        if (config == null) {
          navigation.navigate("ConfigScreen");
        } else {
          setAppConfig(config);
          setAccessToken(await retrieveData("accessToken"));
        }
      }
      getConfigData();
    }, [])
  );

  // check cameraPermission on startup
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraPermission.granted);
    })();
  }, []);

  async function takePic(pic) {
    if (hastakePhoto || pic.faces.length == 0) {
      return;
    }
    setProgressText("Hold Still");
    const options = {
      quality: 0,
      base64: true,
    };
    try {
      await cameraRef.current
        .takePictureAsync(options)
        .then((photo) => {
          setHasTakePhoto(true);
          sendPhoto(photo);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  }

  async function sendPhoto(photo) {
    setProgressText("Verifying...");
    const manipPhoto = await manipulateAsync(
      photo.uri,
      [{ resize: { width: 600, height: 600 } }],
      { base64: true, compress: 0.5 }
    );
    console.log(manipPhoto);
    await axios
      .post(
        appConfig.faceRecogAPI,
        {
          file: manipPhoto.base64,
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
        console.log(response);
        setHasTakePhoto(false);
        setProgressText(
          "Move your head or verification QR Code toward the camera"
        );
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Failed to upload image", error.message, [{ text: "OK" }]);
        setHasTakePhoto(false);
        setProgressText(
          "Move your head or verification QR Code toward the camera"
        );
      });
  }

  async function validateTOTP(barCodeResult) {
    if (hastakePhoto) {
      return;
    }
    console.log(barCodeResult);
    setHasTakePhoto(true);
    setTimeout(() => {
      setHasTakePhoto(false);
    }, 1000);
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
              onBarCodeScanned={(result) => validateTOTP(result.data)}
            >
              <Image
                style={styles.cameraOverlay}
                source={
                  appContex.isConnectedServer
                    ? require("../assets/face-qr-outline.png")
                    : require("../assets/qr-outline.png")
                }
              />
            </Camera>
          )
        )}
      </View>
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
      <Status />
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
