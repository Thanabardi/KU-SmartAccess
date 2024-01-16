import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

export default function Header(props) {
  const navigation = props.navigation;
  const linkAlignLeft = props.linkAlignLeft;
  const screenNavigate = props.screenNavigate;
  const screenNavigateText = props.screenNavigateText;
  const Title = props.Title;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.linkContainer,
          { alignSelf: linkAlignLeft ? "flex-start" : "flex-end" },
        ]}
        onPress={() => navigation.navigate(screenNavigate)}
      >
        <Text style={styles.link}>{screenNavigateText}</Text>
      </TouchableOpacity>
      <Text style={styles.headerText}>{Title}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  linkContainer: {
    marginVertical: 5,
    padding: 10,
    zIndex: 10,
  },
  link: {
    color: colors.blue,
    fontWeight: "500",
    fontSize: normalize(2.2),
  },
  headerText: {
    color: colors.black,
    fontSize: normalize(5),
    fontWeight: "700",
    textAlign: "center",
    marginTop: 15,
  },
});
