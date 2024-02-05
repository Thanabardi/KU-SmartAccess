import { Text, View, Image, StyleSheet } from "react-native";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";
import { useAppContext } from "../contex/AppContex";

export default function Status() {
  const { appContex } = useAppContext();

  function warningStatusUI(statusText) {
    return (
      <View style={styles.statusContainer}>
        <Image
          style={styles.warningIcon}
          source={require("../assets/warning-icon.png")}
        />
        <Text style={styles.warningText}>{statusText}</Text>
      </View>
    );
  }

  function errorStatusUI(statusText) {
    return (
      <View style={styles.statusContainer}>
        <Image
          style={styles.warningIcon}
          source={require("../assets/error-icon.png")}
        />
        <Text style={styles.errorText}>{statusText}</Text>
      </View>
    );
  }

  return (
    <>
      {!appContex.isConnectedDevice && (
        <>{errorStatusUI("Can't connect door controller")}</>
      )}
      {!appContex.isConnectedServer && (
        <>
          {warningStatusUI("Can't connect to the server")}
          {warningStatusUI("User permission may not in sync")}
          {warningStatusUI("Only QR Code and password are available")}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 2,
  },
  warningIcon: {
    resizeMode: "contain",
    height: normalize(2),
    width: normalize(2),
    marginRight: 5,
  },
  warningText: {
    color: colors.yellow,
    fontWeight: "600",
    fontSize: normalize(2),
  },
  errorText: {
    color: colors.red,
    fontWeight: "600",
    fontSize: normalize(2),
  },
});
