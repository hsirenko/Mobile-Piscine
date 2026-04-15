import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { TextInput, Pressable, useWindowDimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';

const CurrentlyScreen = () => (
  <View style={styles.scene}><Text style={styles.sceneText}>Currently</Text></View>
);

const TodayScreen = () => (
  <View style={styles.scene}><Text style={styles.sceneText}>Today</Text></View>
);

const WeeklyScreen = () => (
  <View style={styles.scene}><Text style={styles.sceneText}>Weekly</Text></View>
); 

function TabContent({ tabName, value} : { tabName: string; value: string }) {
    return (
      <View style={styles.scene}>
        <Text style={styles.sceneText}>{tabName}</Text>
        <Text style={styles.sceneText}>{value}</Text>
      </View>
    );
}

export default function App() {
  
  const layout = useWindowDimensions();
  const  [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'search' | 'geo'>('search');

  const displayValue = 
    source === 'geo'
      ? 'Geolocation'
      : query.trim() || 'No search';

  

  const [routes] = useState([
    { key: 'currently', title: 'Currently'},
    { key: 'today', title: 'Today'},
    { key: 'weekly', title: 'Weekly'},
  ]);

  const handleSearchChange = (text: string) => {
    setQuery(text);
    setSource('search');
  }
  
  const handleGeolocationPress = () => {
    setSource('geo');
  };

  const renderScene = ({ route }: { route: { key: string; title: string} }) => {
    switch (route.key) {
      case 'currently':
        return <TabContent tabName="Currently" value={displayValue} />;
      case 'today':
        return <TabContent tabName="Today" value={displayValue} />;
      case 'weekly':
        return <TabContent tabName="Weekly" value={displayValue} />;
      default:
        return null;
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.appBar}>
            <TextInput
            style={styles.searchInput}
            placeholder="Search city..."
            value={query}
            onChangeText={handleSearchChange}
          />
          <Pressable style={styles.geoButton} onPress={handleGeolocationPress}>
            <Ionicons name="locate-outline" size={22} color="#fff" />
          </Pressable>
          </View>

          <TabView
            tabBarPosition="bottom"
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            swipeEnabled
            options={{
              currently: {
                label: ({ color }) => <Text style={[styles.tabLabel, { color }]}>Currently</Text>,
                icon: ({ color, size }) => <Ionicons name="partly-sunny-outline" color={color} size={size} />,
              },
              today: {
                label: ({ color }) => <Text style={[styles.tabLabel, { color }]}>Today</Text>,
                icon: ({ color, size }) => <Ionicons name="today-outline" color={color} size={size} />,
              },
              weekly: {
                label: ({ color }) => <Text style={[styles.tabLabel, { color }]}>Weekly</Text>,
                icon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
              },
            }}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                style={styles.bottomBar}
                indicatorStyle={styles.indicator}
                activeColor="#1f6feb"
                inactiveColor="#6b7280"
              />
            )}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' },

  appBar : {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0f172a',

  },
  searchInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  geoButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    backgroundColor: '#fff',
    minHeight: 56,
  },
  indicator: {
    backgroundColor: '#1f6feb',
    height: 3,
  },

  scene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sceneText: { fontSize: 16, color: '#111827' },
  tabLabel: { fontSize: 12, textTransform: 'none' },
});
