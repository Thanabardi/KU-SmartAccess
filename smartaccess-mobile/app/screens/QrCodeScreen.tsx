global.Buffer = global.Buffer || require('buffer').Buffer;

import stringToHex from "../utils/stringToHex"

import { totpToken, totpOptions } from '@otplib/core';
import { createDigest } from '@otplib/plugin-crypto-js';
import { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import QRCode from 'react-native-qrcode-svg';


export default function QrCodeScreen({}){
  // Wait for implement secret import
  let secret = "TOTPSECRET"
  const [totpKey, setTotpToken] = useState('')

  useEffect(() => {
    const intervalId = setInterval(() => {
      const secretHex = stringToHex(secret)

      const totp = totpToken(
        secretHex,
        totpOptions({
          createDigest,
        }),
      );

      setTotpToken(totp);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [secret]);

  return (
    <View>
        {totpKey? <QRCode value={`${totpKey}`} size={200}/>: null}
    </View>
  )
}