import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

type KeyProps = {
  label: string;
  wide?: boolean;
  minHeight: number;
  fontSize: number;
};

function Key({ label, wide, minHeight, fontSize }: KeyProps) {
  return (
    <Pressable
      style={[wide ? styles.keyWide : styles.key, { minHeight }]}
      onPress={() => {
        console.log('[Button pressed]', label);
      }}
    >
      <Text style={[styles.keyLabel, { fontSize }]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {

  const { width } = useWindowDimensions();
  const maxContentWidth = Math.min(width, 520);
  const scale = Math.min(Math.max(width / 390, 0.85), 1.25); // 390 ≈ common phone width
  const keyFontSize = Math.round(20 * scale);
  const keyMinHeight = Math.round(52 * scale);
  const keySize = { minHeight: keyMinHeight, fontSize: keyFontSize };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <SafeAreaView edges={['top']} style={styles.appBarSafe}>
          <View style={styles.appBar}>
            <Text style={styles.appBarTitle}>Calculator</Text>
          </View>
        </SafeAreaView>

        <View style={[styles.content, { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.displayStack}>
          <TextInput
            style={styles.expressionField}
            value="0"
            editable={false}
            selectTextOnFocus={false}
            showSoftInputOnFocus={false}
          />
          <TextInput
            style={styles.resultField}
            value="0"
            editable={false}
            selectTextOnFocus={false}
            showSoftInputOnFocus={false}
          />
        </View>
        <View style={styles.keypad}>
        <View style={styles.keypadRow}>
          <Key label="AC" {...keySize} />
          <Key label="C" {...keySize} />
          <Key label="/" {...keySize} />
          <Key label="*" {...keySize} />
        </View>
        <View style={styles.keypadRow}>
          <Key label="7" {...keySize} />
          <Key label="8" {...keySize} />
          <Key label="9" {...keySize} />
          <Key label="-" {...keySize} />
        </View>
        <View style={styles.keypadRow}>
          <Key label="4" {...keySize} />
          <Key label="5" {...keySize} />
          <Key label="6" {...keySize} />
          <Key label="+" {...keySize} />
        </View>
        <View style={styles.keypadRow}>
          <Key label="1" {...keySize} />
          <Key label="2" {...keySize} />
          <Key label="3" {...keySize} />
          <Key label="=" {...keySize} />
        </View>
        <View style={styles.keypadRow}>
          <Key label="0" wide {...keySize} />
          <Key label="." {...keySize} />
        </View>
      </View>
        </View>

      <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  appBarSafe: { backgroundColor: '#1a1a2e' },
  appBar: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: { 
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  displayStack: {
    width: '100%',
  },
  expressionField: {
    width: '100%',
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 28,
    textAlign: 'right',
    color: '#111',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  resultField: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 22,
    textAlign: 'right',
    color: '#111',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  keypad: {
    marginTop: 16,
    width: '100%',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  keyWide: {
    flex: 2,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  keyLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
});
