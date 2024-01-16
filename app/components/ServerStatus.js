import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, AppState } from "react-native";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

export default function ServerStatus(props) {
  const appState = useRef(AppState.currentState);
  const [isError, setIsError] = useState(false);

  // check allowed users at first awake
  useEffect(() => {
    GetUserList();
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        GetUserList();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function GetUserList() {
    // get allowed users user list
    console.log("call get user list Api");
    // if error or not
    setIsError(true);
    props.onServerError(true);
  }

  function StatusUI(statusText) {
    return (
      <View style={styles.warningContainer}>
        <Image
          style={styles.warningIcon}
          source={require("../assets/warning-icon.png")}
        />
        <Text style={styles.warningText}>{statusText}</Text>
      </View>
    );
  }

  return (
    <>
      {isError && (
        <>
          {StatusUI("Can't connect to the server")}
          {StatusUI("User permission may not in sync")}
          {StatusUI("Only QR Code or password are available")}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  warningContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 2,
  },
  warningIcon: {
    resizeMode: "contain",
    height: 20,
    width: 20,
  },
  warningText: {
    color: colors.yellow,
    fontWeight: "600",
    fontSize: normalize(2),
  },
});
