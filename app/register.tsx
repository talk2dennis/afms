import { useState } from 'react'
import LoadingComponent from './components/loading'
import createAxiosClient from './api/axiosClient'
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  KeyboardAvoidingView,
  Image,
  Platform
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import colors from '../assets/colors'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import statesLGAs from './data/ng_st_lga'

export default function RegisterPage () {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState({})
  const [selectedState, setSelectedState] = useState('')
  const [selectedLga, setSelectedLga] = useState('')
  const [gsm, setGsm] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const client = createAxiosClient(null)

  const lgaOptions = statesLGAs.find(s => s.state === selectedState)?.lgas || []

  // handle page change
  const handleNextPage = () => {
    setPage(page + 1)
  }

  // handle Previous page
  const handlePreviousPage = () => {
    setPage(page - 1)
  }

  // handle registration
  const handleRegister = async () => {
    setLoading(true)
    // check fields are valid
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !selectedState ||
      !selectedLga ||
      !gsm
    ) {
      ToastAndroid.show('Please fill in all fields', ToastAndroid.LONG)
      return
    }
    // check password match
    if (password !== confirmPassword) {
      ToastAndroid.show('Passwords do not match', ToastAndroid.LONG)
      return
    }
    // submit registration
    try {
      // submit registration data to backend
      const res = await client.post('auth/register', {
        name,
        email,
        password,
        state: selectedState,
        lga: selectedLga,
        gsm
      })
      console.log('Registration successful:', res.data)
      ToastAndroid.show(
        'Registration successful. Please login.',
        ToastAndroid.LONG
      )
      router.push('/signin')
    } catch (error) {
      console.error('Registration error:', error)
      ToastAndroid.show(
        'Registration failed. Please try again.',
        ToastAndroid.LONG
      )
    } finally {
      setLoading(false)
    }
  }

  // if loading show loading indicator
  if (loading) {
    return <LoadingComponent />
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View>
            <Image
              source={require('../assets/afms_logo.png')}
              style={{
                width: 100,
                height: 100,
                alignSelf: 'center',
                marginVertical: 20
              }}
            />
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder='Full Name'
            placeholderTextColor={colors.gray}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder='Phone Number'
            placeholderTextColor={colors.gray}
            keyboardType='phone-pad'
            value={gsm}
            onChangeText={setGsm}
          />

          <TextInput
            style={styles.input}
            placeholder='Email'
            placeholderTextColor={colors.gray}
            autoCapitalize='none'
            keyboardType='email-address'
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder='Password'
            autoCapitalize='none'
            placeholderTextColor={colors.gray}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder='Confirm Password'
            autoCapitalize='none'
            placeholderTextColor={colors.gray}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* State Picker */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedState}
              onValueChange={value => {
                setSelectedState(value)
                setSelectedLga('')
              }}
            >
              <Picker.Item label='Select State' value='' />
              {statesLGAs.map(s => (
                <Picker.Item key={s.state} label={s.state} value={s.state} />
              ))}
            </Picker>
          </View>

          {/* LGA Picker */}
          <View style={styles.pickerWrapper}>
            <Picker
              enabled={!!selectedState}
              selectedValue={selectedLga}
              onValueChange={setSelectedLga}
            >
              <Picker.Item label='Select LGA' value='' />
              {lgaOptions.map(lga => (
                <Picker.Item key={lga} label={lga} value={lga} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingBottom: 24
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: colors.black
  },
  input: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    color: colors.black
  },
  pickerWrapper: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    marginBottom: 12
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24
  }
})
