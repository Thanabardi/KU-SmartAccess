import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Keyboard,
} from "react-native";
import { useCallback, useState } from "react";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

import Header from "../components/Header";
import { deleteData, retrieveData, storeData } from "../utils/saveLoadData";
import { useFocusEffect } from "@react-navigation/native";

const CONFIG = {
  appPassword: "",
  UUID: "",
  CharRead: "",
  CharWrite: "",
  kuUsername: "",
  kuPassword: "",
  tokenAPI: "https://iot.cpe.ku.ac.th/facerecog/api/token/pair",
  participantsAPI:
    "https://iot.cpe.ku.ac.th/facerecog/api/terminal/participants",
  faceRecogAPI: "https://iot.cpe.ku.ac.th/facerecog/api/terminal/recognition",
};

export default function ConfigScreen({ props }) {
  const [appConfig, setAppConfig] = useState(CONFIG);
  const [appPassword, setAppPassword] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  useFocusEffect(
    useCallback(() => {
      async function getConfigData() {
        const config = await retrieveData("config");
        if (config == null) {
          setCanEdit(true);
        } else {
          setAppConfig(config);
        }
      }
      getConfigData();
    }, [])
  );

  function onSubmitPassword() {
    Keyboard.dismiss();
    if (appConfig.appPassword == appPassword) {
      setCanEdit(true);
    } else {
      Alert.alert("Incorrect Password", "Please try again", [{ text: "OK" }]);
    }
  }

  function checkNullConfig() {
    const key = Object.keys(CONFIG);
    for (let i = 0; i < key.length; i++) {
      if (key[i] in appConfig && appConfig[key[i]] != "") {
        continue;
      }
      return false;
    }
    return true;
  }

  async function onSubmitConfigData() {
    Keyboard.dismiss();
    if (checkNullConfig()) {
      await storeData("config", appConfig);
      await props?.getParticipants();
    } else {
      Alert.alert("All fields must be completed", "", [{ text: "OK" }]);
    }
  }

  function onSubmitDeleteData() {
    Alert.alert(
      "Reset Data",
      "Are you sure you want to delete all configuration setting?",
      [
        {
          text: "Yes",
          onPress: async () => {
            await deleteData("config");
            await deleteData("participants");
            await deleteData("accessToken");
            setAppConfig(CONFIG);
            setCanEdit(true);
          },
        },
        { text: "No" },
      ]
    );
  }

  function inputFiledUI(field, label, placeholder) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLable}>{label}</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) =>
            setAppConfig((values) => ({ ...values, [field]: text }))
          }
          defaultValue={appConfig[field]}
          placeholder={placeholder}
          autoCapitalize="none"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Header
        props={{
          linkAlignLeft: true,
          screenNavigate: "FaceQRScreen",
          screenNavigateText: "< Exit",
          Title: "Config",
        }}
      />
      {canEdit ? (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContainer}
          >
            <Text style={styles.inputGroupTitle}>APP CONFIG</Text>
            <View style={styles.inputGroup}>
              {inputFiledUI("appPassword", "App Password", "App Password")}
            </View>
            <Text style={styles.inputGroupTitle}>TERMINAL CONFIG</Text>
            <View style={styles.inputGroup}>
              {inputFiledUI(
                "UUID",
                "UUID",
                "00000000-0000-0000-0000-000000000000"
              )}
              {inputFiledUI(
                "CharRead",
                "Characteristic Read Message",
                "00000000-0000-0000-0000-000000000000"
              )}
              {inputFiledUI(
                "CharWrite",
                "Characteristic Write Message",
                "00000000-0000-0000-0000-000000000000"
              )}
            </View>
            <Text style={styles.inputGroupTitle}>SERVER CONFIG</Text>
            <View style={styles.inputGroup}>
              {inputFiledUI("kuUsername", "KU Account Username", "KU Username")}
              {inputFiledUI("kuPassword", "KU Account Password", "KU Password")}
            </View>
            <Text style={styles.inputGroupTitle}>API</Text>
            <View style={styles.inputGroup}>
              {inputFiledUI(
                "tokenAPI",
                "Token",
                "https://iot.cpe.ku.ac.th/token"
              )}
              {inputFiledUI(
                "participantsAPI",
                "Participants",
                "https://iot.cpe.ku.ac.th/participants"
              )}
              {inputFiledUI(
                "faceRecogAPI",
                "Face Recognition",
                "https://iot.cpe.ku.ac.th/facerecog"
              )}
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => onSubmitConfigData()}
            >
              <Text style={styles.submitButtonLabel}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      ) : (
        <View style={styles.loginContainer}>
          <TextInput
            style={styles.loginInput}
            onChangeText={setAppPassword}
            onSubmitEditing={onSubmitPassword}
            value={appPassword}
            placeholder="App Password"
            autoCapitalize="none"
            secureTextEntry={true}
          />
          <TouchableOpacity
            style={styles.loginSubmitButton}
            onPress={() => onSubmitPassword()}
          >
            <Text style={styles.submitButtonLabel}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSubmitDeleteData()}>
            <Text style={styles.loginReset}>Reset password and setting</Text>
          </TouchableOpacity>
        </View>
      )}
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
  scrollView: {
    width: "100%",
    marginTop: normalize(3),
  },
  scrollViewContainer: {
    paddingBottom: normalize(9),
    marginHorizontal: normalize(2.5),
  },
  inputGroup: {
    marginBottom: normalize(2.5),
    backgroundColor: colors.gray,
    borderRadius: normalize(1.5),
  },
  inputGroupTitle: {
    color: colors.darkGray,
    fontSize: normalize(2),
    marginLeft: 10,
    marginVertical: 5,
  },
  inputContainer: {
    padding: 8,
    borderBottomColor: colors.white,
    borderBottomWidth: 1,
  },
  inputLable: {
    marginBottom: 5,
    fontSize: normalize(2),
  },
  input: {
    flex: 1,
    fontSize: normalize(2.5),
    backgroundColor: colors.white,
    borderRadius: normalize(1),
    padding: 5,
  },
  submitButton: {
    backgroundColor: colors.blue,
    borderRadius: normalize(1.5),
    marginTop: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonLabel: {
    fontSize: normalize(3),
    fontWeight: "500",
    color: colors.white,
  },
  loginSubmitButton: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.blue,
    borderRadius: normalize(1.5),
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loginContainer: {
    height: "20%",
    width: "80%",
    alignItems: "center",
    marginTop: 20,
  },
  loginInput: {
    flex: 1,
    width: "100%",
    fontSize: normalize(2.5),
    backgroundColor: colors.gray,
    borderRadius: normalize(1.5),
    paddingHorizontal: 10,
  },
  loginReset: {
    fontSize: normalize(2),
    color: colors.blue,
    marginTop: 10,
  },
});
