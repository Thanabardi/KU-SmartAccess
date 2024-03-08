import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import QrCodeScreen from './app/screens/QrCodeScreen'

export default function App() {
  return (
    <View style={styles.container}>
      <QrCodeScreen /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
