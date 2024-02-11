import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import * as RootNavigation from '../utils/RootNavigation.js';

import { normalize } from "../utils/normalize";

export default function Menu() {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsOpenMenu(!isOpenMenu)}
      >
        <Image
          style={styles.imageIcon}
          source={require("../assets/menu-icon.png")}
        />
      </TouchableOpacity>
      {isOpenMenu && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsOpenMenu(!isOpenMenu)}
          >
            <Text style={styles.iconLabel}>Fetch Data</Text>
            <Image
              style={styles.imageIcon}
              source={require("../assets/refresh-icon.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {RootNavigation.navigate("ConfigScreen"); setIsOpenMenu(!isOpenMenu)}}
          >
            <Text style={styles.iconLabel}>Setting</Text>
            <Image
              style={styles.imageIcon}
              source={require("../assets/setting-icon.png")}
            />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    right: 8,
    bottom: 45,
  },
  button: {
    marginVertical: 5,
    flexDirection: "row",
    alignSelf: "flex-end",
  },
  imageIcon: {
    aspectRatio: 1 / 1,
    width: normalize(2.5),
    resizeMode: "contain",
  },
  iconLabel: {
    marginRight: 5,
    fontSize: normalize(2),
  },
});
