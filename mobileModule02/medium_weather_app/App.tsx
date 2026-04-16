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

type TabContentProps = {
  tabName: string;
  value: string;       
  locationDebug: string; 
};

function TabContent({ tabName, value, locationDebug} : TabContentProps {
    return (
      <View style={styles.scene}>
        <Text style={styles.sceneText}>{tabName}</Text>
        <Text style={styles.sceneText}>{value}</Text>
        <Text style={styles.debugText}>{locationDebug}</Text>
      </View>
    );
}

export default function App() {
  
  const layout = useWindowDimensions();
  const  [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'search' | 'geo'>('search');

  const [locationPermission, setLocationPermission] = useState<
  'granted' | 'denied' | 'undetermined'
>('undetermined');

  const [coords, setCoords] = useState<{latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const locationDebugText = locationLoading
  ? 'Getting location...'
  : locationError
  ? locationError
  : coords
  ? `Lat: ${coords.latitude.toFixed(5)}, Lon: ${coords.longitude.toFixed(5)}`
  : 'Location not available';

  // const [locationPermission, setLocationPermission] = useState<
  // 'granted' | 'denied' | 'undetermined'>('undetermined');

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

  const renderScene = ({ route }: { route: { key: string; title: string} }) => {
    switch (route.key) {
      case 'currently':
        return <TabContent tabName="Currently" value={displayValue} locationDebug={locationDebugText} />;
      case 'today':
        return <TabContent tabName="Today" value={displayValue} locationDebug={locationDebugText} />;
      case 'weekly':
        return <TabContent tabName="Weekly" value={displayValue} locationDebug={locationDebugText} />;
      default:
        return null;
    }
  }

  const handleGeolocationPress = () => {
    await requestAndGetLocation();
  };

  useEffect(() => {
    requestAndGetLocation();
  }, []);

  const requestAndGetLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setSource('geo'); // keep your existing mode behavior
    } catch (e) {
      setLocationError('Unable to fetch location');
    } finally {
      setLocationLoading(false);
    }
  };

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
  debugText: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
  },

  scene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sceneText: { fontSize: 16, color: '#111827' },
  tabLabel: { fontSize: 12, textTransform: 'none' },
});
