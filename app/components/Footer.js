import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

import colors from "../config/colors";
import { normalize } from "../utils/normalize";

export default function Footer() {
  const [dt, setDt] = useState(new Date().toLocaleString());

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

  // use to setInterval without delay first
  function setIntervalImmediately(func, interval) {
    func();
    return setInterval(func, interval);
  }

  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>{dt[1]}</Text>
      <Text style={styles.footerText}>{dt[0]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: colors.darkGray,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 5,
  },
  footerText: {
    color: colors.white,
    fontSize: normalize(3),
    fontWeight: "500",
    marginHorizontal: 20,
  },
});
