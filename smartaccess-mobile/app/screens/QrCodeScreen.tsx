global.Buffer = global.Buffer || require('buffer').Buffer;

import stringToHex from "../utils/stringToHex"

import { totpToken, totpOptions } from '@otplib/core';
import { createDigest } from '@otplib/plugin-crypto-js';
import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { Countdown } from "../components/CircleCountdown";

export default function QrCodeScreen({}){
  // Wait for implement secret import
  let secret = "TOTPSECRET"
  const [totpKey, setTotpToken] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      let timeoutId: ReturnType<typeof setTimeout>;
      const secretHex = stringToHex(secret)

      const totp = await totpToken(
        secretHex,
        totpOptions({
          createDigest,
        }),
      );

      setTotpToken(totp);

      timeoutId = setTimeout(fetchData, 500);
      return timeoutId
    };
    // fetchData()
    const timeoutId  = fetchData();
    return () => clearTimeout(timeoutId);
  }, [secret]);

  return (
    <View>
        {totpKey? 
        <>
          <Text style={styles.header}> TOTP QR CODE</Text>
          <View style={styles.elevation}>
            <QRCode value={`${totpKey}`} size={250} />     
          </View>   
          <View style={styles.container}>
            <Countdown />
          </View>
        </>
        : <ActivityIndicator size="large" color="#0000ff"/>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elevation: {
    paddingHorizontal:20, 
    paddingVertical:20,
    elevation: 20,
    shadowColor: '#171717',
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
});