import { useEffect, useState } from 'react'
import createAxiosClient from '../api/axiosClient'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
  Image
} from 'react-native'
import * as Location from 'expo-location'
import { useSession } from '../auth/context'
import { fetchWeatherApi } from 'openmeteo'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import LoadingComponent from '../components/loading'
import { AxiosInstance } from 'axios'

/* ----------------------------- Types ----------------------------- */

type WeatherData = {
  current: {
    time: Date
    showers: number
    rain: number
  }
  daily: {
    time: Date[]
    rain_sum: number[]
    showers_sum: number[]
    snowfall_sum: number[]
  }
}

type AlertData = {
  _id: string
  title: string
  message: string
  severity: 'WARNING' | 'CRITICAL' | 'INFO'
  target: {
    state: String
    lga: String
  }
  createdAt?: string | null
}

/* -------------------------- Helper Style -------------------------- */

const getRainStyle = (rain: number) => {
  if (rain >= 10) {
    return { bg: '#e6f2ff', color: '#1e90ff' }
  }
  if (rain > 0) {
    return { bg: '#fff7e6', color: '#f4a100' }
  }
  return { bg: '#f5f5f5', color: '#999' }
}

const getAlertPalette = (severity: AlertData['severity']) => {
  if (severity === 'CRITICAL') {
    return {
      bg: '#fff1f2',
      border: '#ef4444',
      badgeBg: '#ef4444',
      badgeText: '#ffffff',
      icon: 'alert-octagon'
    }
  }
  if (severity === 'WARNING') {
    return {
      bg: '#fff7ed',
      border: '#f97316',
      badgeBg: '#f97316',
      badgeText: '#ffffff',
      icon: 'alert'
    }
  }
  if (severity === 'INFO') {
    return {
      bg: '#fffbeb',
      border: '#f59e0b',
      badgeBg: '#f59e0b',
      badgeText: '#111827',
      icon: 'alert-circle'
    }
  }

  return {
    bg: '#eff6ff',
    border: '#3b82f6',
    badgeBg: '#3b82f6',
    badgeText: '#ffffff',
    icon: 'information-outline'
  }
}

const toAlertSeverity = (value: unknown): AlertData['severity'] => {
  const severity = String(value || 'INFO').toUpperCase()
  if (severity === 'WARNING') return 'WARNING'
  if (severity === 'CRITICAL') return 'CRITICAL'
  return 'INFO'
}

const formatAlertTime = (value?: string | null) => {
  if (!value) return 'Recent'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Recent'
  return parsed.toLocaleString()
}

/* -------------------------- update user location -------------------------- */
const updateUserLocation = async (
  client: AxiosInstance,
  latitude: number,
  longitude: number
) => {
  client
    .put('auth/me', { location: [latitude, longitude] })
    .then(res => {
      console.log('location update response:', res.data)
      ToastAndroid.show('Location updated successfully', ToastAndroid.LONG)
      return res.data
    })
    .catch(error => {
      ToastAndroid.show('Location update failed', ToastAndroid.LONG)
      console.log('Location update error:', error)
    })
}

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

/* ----------------------------- Component ----------------------------- */

export default function HomePage () {
  const { signOut, userData, setUserData } = useSession()

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [latestAlert, setLatestAlert] = useState<AlertData | null>(null)
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [alertsError, setAlertsError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const client = createAxiosClient(userData?.token || null)

  /* ------------------------- Weather Loader ------------------------- */

  const loadWeather = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!userData) {
        signOut()
        return
      }

      let latitude = userData.location?.[0]
      let longitude = userData.location?.[1]

      // If user has no saved location → get device location
      if (
        latitude === null ||
        latitude === undefined ||
        longitude === null ||
        longitude === undefined
      ) {
        console.log('No saved location, requesting device location...')
        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== 'granted') {
          throw new Error('Location permission denied')
        }

        const deviceLocation = await Location.getCurrentPositionAsync({})

        latitude = deviceLocation.coords.latitude
        longitude = deviceLocation.coords.longitude
        // Update user location on server for future use
        console.log(
          `user location obtained: lat=${latitude}, lon=${longitude}, updating server...`
        )
        const res = await updateUserLocation(client, latitude, longitude)
        console.log('User location updated on server:', res)
        if (setUserData) {
          setUserData({ ...userData, location: [latitude, longitude] })
        }
      }

      const params = {
        latitude,
        longitude,
        daily: ['rain_sum', 'showers_sum', 'snowfall_sum'],
        current: ['showers', 'rain'],
        timezone: 'auto',
        forecast_days: 7
      }

      const responses = await fetchWeatherApi(WEATHER_URL, params)
      const response = responses[0]

      const utcOffsetSeconds = response.utcOffsetSeconds()
      const current = response.current()!
      const daily = response.daily()!

      const parsedData: WeatherData = {
        current: {
          time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
          showers: current.variables(0)!.value(),
          rain: current.variables(1)!.value()
        },
        daily: {
          time: Array.from(
            {
              length:
                (Number(daily.timeEnd()) - Number(daily.time())) /
                daily.interval()
            },
            (_, i) =>
              new Date(
                (Number(daily.time()) +
                  i * daily.interval() +
                  utcOffsetSeconds) *
                  1000
              )
          ),
          rain_sum: Array.from(daily.variables(0)!.valuesArray()!),
          showers_sum: Array.from(daily.variables(1)!.valuesArray()!),
          snowfall_sum: Array.from(daily.variables(2)!.valuesArray()!)
        }
      }

      setWeatherData(parsedData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather.')
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      setAlertsLoading(true)
      setAlertsError(null)

      const response = await client.get('alerts')

      if (response.data.length > 0) {
        setLatestAlert(response.data[0])
      } else {
        setLatestAlert(null)
      }
    } catch (err: any) {
      setAlertsError(err?.message || 'Unable to fetch alerts')
      setLatestAlert(null)
    } finally {
      setAlertsLoading(false)
    }
  }

  /* ----------------------------- Effects ----------------------------- */

  useEffect(() => {
    loadWeather()
    loadAlerts()
  }, [])

  /* ----------------------------- UI States ----------------------------- */

  if (loading) return <LoadingComponent />

  if (error)
    return (
      <View style={styles.center}>
        <Ionicons name='warning-outline' size={40} color='red' />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadWeather}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    )

  if (!weatherData) return null

  /* ----------------------------- UI ----------------------------- */

  return (
    <View style={styles.screen}>
      <View style={styles.topOverlay}>
        <View style={styles.topBar}>
          <Image
            source={require('../../assets/afms_logo.png')}
            style={styles.logo}
            resizeMode='contain'
          />
          <Text style={styles.topBarTitle}>AFMS Home</Text>
          <TouchableOpacity
            style={styles.menuToggleButton}
            onPress={() => setMenuOpen(prev => !prev)}
          >
            <Ionicons
              name={menuOpen ? 'close-outline' : 'menu-outline'}
              size={22}
              color='#fff'
            />
          </TouchableOpacity>
        </View>

        {menuOpen && (
          <View style={styles.userMenuCard}>
            <Text style={styles.userMenuTitle}>My Profile</Text>

            <View style={styles.menuInfoRow}>
              <Ionicons name='person-outline' size={16} color='#374151' />
              <Text style={styles.menuInfoText}>
                {userData?.name || 'User'}
              </Text>
            </View>

            <View style={styles.menuInfoRow}>
              <Ionicons name='mail-outline' size={16} color='#374151' />
              <Text style={styles.menuInfoText}>{userData?.email || '-'}</Text>
            </View>

            <View style={styles.menuInfoRow}>
              <Ionicons name='location-outline' size={16} color='#374151' />
              <Text style={styles.menuInfoText}>
                {userData?.lga || 'Unknown LGA'},{' '}
                {userData?.state || 'Unknown State'}
              </Text>
            </View>

            <TouchableOpacity style={styles.menuLogoutButton} onPress={signOut}>
              <Ionicons name='log-out-outline' size={18} color='#fff' />
              <Text style={styles.menuLogoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Alerts */}
        <View style={styles.alertSection}>
          <View style={styles.alertSectionHeader}>
            <Text style={styles.alertSectionTitle}>Live Alert</Text>
            <TouchableOpacity onPress={loadAlerts}>
              <Text style={styles.alertRefreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {alertsLoading ? (
            <View style={styles.alertLoadingCard}>
              <ActivityIndicator size='small' color='#f97316' />
              <Text style={styles.alertLoadingText}>
                Checking for alerts...
              </Text>
            </View>
          ) : alertsError ? (
            <View style={styles.alertFallbackCard}>
              <Ionicons name='warning-outline' size={18} color='#ef4444' />
              <Text style={styles.alertFallbackText}>{alertsError}</Text>
            </View>
          ) : latestAlert ? (
            <View
              style={[
                styles.alertCard,
                {
                  backgroundColor: getAlertPalette(latestAlert.severity).bg,
                  borderColor: getAlertPalette(latestAlert.severity).border
                }
              ]}
            >
              <View style={styles.alertTopRow}>
                <View style={styles.alertIconWrap}>
                  <MaterialCommunityIcons
                    name={getAlertPalette(latestAlert.severity).icon as any}
                    size={20}
                    color={getAlertPalette(latestAlert.severity).border}
                  />
                </View>
                <View
                  style={[
                    styles.alertBadge,
                    {
                      backgroundColor: getAlertPalette(latestAlert.severity)
                        .badgeBg
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.alertBadgeText,
                      {
                        color: getAlertPalette(latestAlert.severity).badgeText
                      }
                    ]}
                  >
                    {latestAlert.severity}
                  </Text>
                </View>
              </View>

              <Text style={styles.alertTitle}>{latestAlert.title}</Text>
              <Text style={styles.alertMessage}>{latestAlert.message}</Text>

              <View style={styles.alertMetaRow}>
                <Ionicons name='location-outline' size={14} color='#374151' />
                <Text style={styles.alertMetaText}>
                  {latestAlert.target?.lga}, {latestAlert.target?.state}
                </Text>
              </View>

              <View style={styles.alertMetaRow}>
                <Ionicons name='time-outline' size={14} color='#374151' />
                <Text style={styles.alertMetaText}>
                  {formatAlertTime(latestAlert.createdAt)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.alertFallbackCard}>
              <Ionicons
                name='checkmark-circle-outline'
                size={18}
                color='#16a34a'
              />
              <Text style={styles.alertFallbackText}>
                No active alerts right now.
              </Text>
            </View>
          )}
        </View>

        {/* Current Weather */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Weather</Text>

          <View style={styles.row}>
            <MaterialCommunityIcons
              name='weather-rainy'
              size={24}
              color='#1e90ff'
            />
            <Text style={styles.cardText}>
              Rain: {weatherData.current.rain} mm
            </Text>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons
              name='weather-pouring'
              size={24}
              color='#4682b4'
            />
            <Text style={styles.cardText}>
              Showers: {weatherData.current.showers} mm
            </Text>
          </View>

          <Text style={styles.timeText}>
            {weatherData.current.time.toLocaleString()}
          </Text>
        </View>

        {/* 7-Day Forecast */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>7-Day Forecast</Text>

          {weatherData.daily.time.map((date, index) => {
            const rain = weatherData.daily.rain_sum[index] || 0
            const rainStyle = getRainStyle(rain)

            return (
              <View
                key={index}
                style={[styles.dailyItem, { backgroundColor: rainStyle.bg }]}
              >
                <Text style={styles.dateText}>{date.toDateString()}</Text>

                <View style={styles.row}>
                  <Ionicons
                    name='rainy-outline'
                    size={18}
                    color={rainStyle.color}
                  />
                  <Text style={styles.dailyText}>Rain: {rain} mm</Text>
                </View>

                <View style={styles.row}>
                  <Ionicons
                    name='water-outline'
                    size={18}
                    color={rainStyle.color}
                  />
                  <Text style={styles.dailyText}>
                    Showers: {weatherData.daily.showers_sum[index] || 0} mm
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

/* ----------------------------- Styles ----------------------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f4f7'
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 10
  },
  topBar: {
    height: 52,
    borderRadius: 14,
    paddingRight: 14,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  menuToggleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userMenuCard: {
    marginTop: 8,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  userMenuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10
  },
  menuInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  menuInfoText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#374151',
    flex: 1
  },
  menuLogoutButton: {
    marginTop: 6,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuLogoutText: {
    marginLeft: 6,
    color: '#fff',
    fontWeight: '700'
  },
  container: {
    paddingTop: 78,
    padding: 16,
    backgroundColor: '#f2f4f7'
  },
  alertSection: {
    marginBottom: 16
  },
  alertSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  alertSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  alertRefreshText: {
    color: '#2563eb',
    fontWeight: '600'
  },
  alertLoadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center'
  },
  alertLoadingText: {
    marginLeft: 8,
    color: '#374151'
  },
  alertFallbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center'
  },
  alertFallbackText: {
    marginLeft: 8,
    color: '#374151',
    flex: 1
  },
  alertCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  alertIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffffaa',
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6
  },
  alertMessage: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 12
  },
  alertMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  alertMetaText: {
    marginLeft: 6,
    color: '#374151',
    fontSize: 12
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
    marginTop: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e90ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 8,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  dailyItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  dailyText: {
    marginLeft: 6,
    fontSize: 14
  },
  cardText: {
    fontSize: 16,
    marginLeft: 6
  },
  timeText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  dateText: {
    fontWeight: '600'
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    padding: 14,
    borderRadius: 10,
    marginTop: 10
  },
  logoutText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600'
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 10
  }
})
