import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

type KeyProps = {
  label: string;
  wide?: boolean;
  minHeight: number;
  fontSize: number;
  onPress: (label: string) => void;
};

function Key({ label, wide, minHeight, fontSize, onPress }: KeyProps) {
  return (
    <Pressable
      style={[wide ? styles.keyWide : styles.key, { minHeight }]}
      onPress={() => onPress(label)}
    >
      <Text style={[styles.keyLabel, { fontSize }]}>{label}</Text>
    </Pressable>
  );
}

const OPERATORS = ['+', '-', '*', '/'] as const;
const isOperator = (ch: string) => OPERATORS.includes(ch as (typeof OPERATORS)[number]);

function tokenize(expr: string): string[] {

  const compact = expr.replace(/\s+/g, '');
  const raw = compact.match(/\d*\.?\d+|[+\-*/]/g) ?? [];

  const tokens: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];

    if (
      t === '-' &&
      ( i === 0 || isOperator(raw[i - 1])) &&
      i + 1 < raw.length &&
      !isOperator(raw[i + 1])
    ) {
      tokens.push(`-${raw[i + 1]}`);
      i++;
      continue;
    }
    tokens.push(t);
  }
  return tokens;
}

function evaluateExpression(expr: string): string {

  const tokens = tokenize(expr);

  //Basic validity check
  if (tokens.length === 0) return '0';
  if (isOperator(tokens[0]) || isOperator(tokens[tokens.length - 1])) return 'Error';

  // Build typed array and validate
  const values: (number | string)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (isOperator(t)) {
      // operators can only be at odd indices in a valid alternating expression
      if (i % 2 === 0) return 'Error';
      values.push(t);
    } else {
      // numbers can only be at even indices
      if (i % 2 !== 0) return 'Error';
      const n = Number(t);
      if (!Number.isFinite(n)) return 'Error';
      values.push(n);
    }
  }

  //Pass 1: * and /
  const pass1: (number | string)[] = [];
  if (typeof values[0] !== 'number') return 'Error';
  pass1.push(values[0]);

  for (let i = 1; i < values.length; i += 2) {
    const op = values[i];
    const right = values[i + 1];

    if (typeof op !== 'string' || typeof right !== 'number') return 'Error';

    if (op === '*' || op === '/') {
      const leftRaw = pass1.pop();
      if (typeof leftRaw !== 'number') return 'Error';

      if (op === '/' && right === 0) return 'Error';
      
      const computed = op === '*' ? leftRaw * right : leftRaw / right;
      if (!Number.isFinite(computed)) return 'Error';

      pass1.push(computed);
    } else {
      pass1.push(op, right);
    }
  }

  //Pass 2: + and -
  const first = pass1[0];
  if (typeof first !== 'number') return 'Error';
  
  let total = first;
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i];
    const right = pass1[i + 1];

    if ((op !== '+' && op !== '-') || typeof right !== 'number') return 'Error';

    total = op === '+' ? total + right : total - right; 
    if (!Number.isFinite(total)) return 'Error';
  }

  // Clean floating-point artefacts
  const normalized = Number(total.toFixed(10));
  return normalized.toString();
}

function safeEvaluate(expr: string): string {
  try {
    return evaluateExpression(expr);
  } catch (err) {
    console.error('[Eval error]', err);
    return 'Error';
  }
}

export default function App() {

  const { width } = useWindowDimensions();
  const maxContentWidth = Math.min(width, 520);
  const scale = Math.min(Math.max(width / 390, 0.85), 1.25); // 390 ≈ common phone width
  const keyFontSize = Math.round(20 * scale);
  const keyMinHeight = Math.round(52 * scale);
  const keySize = { minHeight: keyMinHeight, fontSize: keyFontSize };
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState('0');

  const handleKeyPress = (label: string) => {
    console.log('[Button pressed]', label);

    if (label === 'AC') {
      setExpression('0');
      setResult('0');
      return;
    }

    if (label === 'C') {
      setExpression((prev) => {
        const next = prev.length <= 1 ? '0' : prev.slice(0, -1);
        return next;
      })
      return; 
    }

    if (label === '=') {
      setResult(safeEvaluate(expression));
      return;
    }

    setExpression((prev) => {
      const last = prev[prev.length - 1];
      // Digits
      if (/^\d$/.test(label)) {
        return prev === '0' ? label : prev + label;
      }
      // Decimal point
      if (label === '.') {
        // block multiple dots in current number segment
        const parts = prev.split(/[+\-*/]/);
        const currentNumber = parts[parts.length - 1] ?? '';
        if (currentNumber.includes('.')) return prev;
        return prev + '.';
      }
      // Operators + - * /
      if (isOperator(label)) {
        // allow negative start only for "-"
        if (prev === '0') return label === '-' ? '-' : prev;
        // replace trailing operator instead of duplicating
        if (isOperator(last)) {
          // Allow unary minus after * or /  => 5*-2, 10/-2
          if (label === '-' && (last === '*' || last === '/')) {
            return prev + label;
          }
          //otherwise, return replace last operator
          return prev.slice(0, -1) + label;
        } 
        return prev + label;
      }
      return prev;
    });
  }

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
            value={expression}
            editable={false}
            selectTextOnFocus={false}
            showSoftInputOnFocus={false}
          />
          <TextInput
            style={styles.resultField}
            value={result}
            editable={false}
            selectTextOnFocus={false}
            showSoftInputOnFocus={false}
          />
        </View>
        <View style={styles.keypad}>
        <View style={styles.keypadRow}>
          <Key label="AC" {...keySize} onPress={handleKeyPress} />
          <Key label="C" {...keySize} onPress={handleKeyPress} />
          <Key label="/" {...keySize} onPress={handleKeyPress} />
          <Key label="*" {...keySize} onPress={handleKeyPress} />
        </View>
        <View style={styles.keypadRow}>
          <Key label="7" {...keySize} onPress={handleKeyPress} />
          <Key label="8" {...keySize} onPress={handleKeyPress} />
          <Key label="9" {...keySize} onPress={handleKeyPress} />
          <Key label="-" {...keySize} onPress={handleKeyPress} />
        </View>
        <View style={styles.keypadRow}>
          <Key label="4" {...keySize} onPress={handleKeyPress} />
          <Key label="5" {...keySize} onPress={handleKeyPress} />
          <Key label="6" {...keySize} onPress={handleKeyPress} />
          <Key label="+" {...keySize} onPress={handleKeyPress} />
        </View>
        <View style={styles.keypadRow}>
          <Key label="1" {...keySize} onPress={handleKeyPress} />
          <Key label="2" {...keySize} onPress={handleKeyPress} />
          <Key label="3" {...keySize} onPress={handleKeyPress} />
          <Key label="=" {...keySize} onPress={handleKeyPress} />
        </View>
        <View style={styles.keypadRow}>
          <Key label="0" wide {...keySize} onPress={handleKeyPress} />
          <Key label="." {...keySize} onPress={handleKeyPress} />
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
