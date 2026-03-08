import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useRouter } from 'expo-router'
import colors from '../assets/colors'
import createAxiosClient from './api/axiosClient'

export default function ForgotPassword () {
  const router = useRouter()
  const client = createAxiosClient(null)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const requestPasswordReset = async () => {
    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      await client.post('auth/forgot-password', { email })
      Alert.alert('Reset Link Sent', 'A password reset link has been sent to your email.')
      setStep(2)
    } catch (error: any) {
      Alert.alert(
        'Request Failed',
        error?.response?.data?.message || 'Unable to send reset link. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetPasswordWithToken = async () => {
    if (!token.trim()) {
      Alert.alert('Token Required', 'Paste the reset token sent to your email')
      return
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await client.post('auth/reset-password', {
        token: token.trim(),
        newPassword: password
      })
      Alert.alert('Success', 'Password changed successfully. Please sign in.')
      router.replace('/signin')
    } catch (error: any) {
      Alert.alert(
        'Reset Failed',
        error?.response?.data?.message || 'Unable to reset password. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.card}>
            {step === 1 && (
              <>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.text}>Enter your email to receive a reset link.</Text>

                <TextInput
                  style={styles.input}
                  placeholder='Email'
                  placeholderTextColor={colors.gray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={requestPasswordReset}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.title}>Check Your Email</Text>
                <Text style={styles.text}>
                  We sent a password reset link to {email}. Click the link to open the web page
                  where you can set a new password.
                </Text>
                <Text style={styles.text}>
                  If you prefer, copy the token from your email and paste it here to complete the
                  password change in the app.
                </Text>

                <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                  <Text style={styles.buttonText}>I Have A Token</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
                  onPress={requestPasswordReset}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    {loading ? 'Sending...' : 'Resend Link'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.title}>Change Password</Text>
                <Text style={styles.text}>
                  Paste your reset token, then choose a new password.
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder='Reset token'
                  placeholderTextColor={colors.gray}
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize='none'
                />

                <TextInput
                  style={styles.input}
                  placeholder='New password'
                  placeholderTextColor={colors.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TextInput
                  style={styles.input}
                  placeholder='Confirm password'
                  placeholderTextColor={colors.gray}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={resetPasswordWithToken}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Updating...' : 'Change Password'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20
  },
  card: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center'
  },
  text: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    color: colors.black
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary
  },
  secondaryButtonText: {
    color: colors.primary
  },
  buttonDisabled: {
    opacity: 0.6
  }
})
