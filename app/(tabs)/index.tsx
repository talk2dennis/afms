import { useEffect, useState } from 'react'
import createAxiosClient from '../api/axiosClient'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid
} from 'react-native'
import * as Location from 'expo-location'
import { useSession } from '../auth/context'
import { fetchWeatherApi } from 'openmeteo'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import LoadingComponent from '../components/loading'

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

/* -------------------------- update user location -------------------------- */
const updateUserLocation = async (latitude: number, longitude: number) => {
  const client = createAxiosClient(null)

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
  const { signOut, userData } = useSession()

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        const res = await updateUserLocation(latitude, longitude)
        console.log('User location updated on server:', res)
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

  /* ----------------------------- Effects ----------------------------- */

  useEffect(() => {
    loadWeather()
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name='partly-sunny' size={32} color='#fff' />
        <Text style={styles.headerText}>Weather Forecast</Text>
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

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Ionicons name='log-out-outline' size={20} color='#fff' />
        <Text style={styles.logoutText}>Sign Out {userData?.name}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

/* ----------------------------- Styles ----------------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f4f7'
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
  }
})
