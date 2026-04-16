import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [showHello, setShowHello] = useState(false);
  return (
    <View style={styles.container}>
      <Text>{showHello ?  'Hello World!' : 'My first ever react native app!'}</Text>
      <Pressable style={styles.button} 
      onPress={() => {
        console.log('Button pressed');
        setShowHello((prev) => !prev);
      }}>
        <Text style={styles.buttonLabel}>Please me</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});
