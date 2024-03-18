import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

export async function storeData(key, value) {
  const jsonValue = JSON.stringify(value);
  await SecureStore.setItemAsync(key, jsonValue)
    .then(() => {
      if (key == "config") {
        Alert.alert("Success", "Applied Configuration Changes", [{ text: "OK" }]);
      }
    })
    .catch((error) =>
      Alert.alert(
        "Fail", `There was an error while applying the configuration changes\n${error.message}`,"",
        [{ text: "OK" }]
      )
    );
}

export async function retrieveData(key) {
  return await SecureStore.getItemAsync(key)
    .then((value) => {
      if (value == null) {
        return null;
      }
      return JSON.parse(value);
    })
    .catch((error) => {
      Alert.alert("Fail", `Unable to load configuration\n${error.message}`, [{ text: "OK" }]);
    });
}

export async function deleteData(key) {
  await SecureStore.deleteItemAsync(key).catch((error) => {
    Alert.alert("Fail", `Unable to delete data\n${error.message}`, [{ text: "OK" }]);
  });
}
