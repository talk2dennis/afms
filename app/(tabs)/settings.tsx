import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ToastAndroid
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import SectionCard from '../components/sectionCard'
import ToggleRow from '../components/toggleRow'
import { useSession } from '../auth/context'
import * as Location from 'expo-location'
import createAxiosClient from '../api/axiosClient'

export default function SettingsPage () {
  const { userData, signOut } = useSession()
  const client = createAxiosClient(userData?.token || null)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    state: userData?.state || '',
    lga: userData?.lga || '',
    bio: '',
    location: userData?.location || [0, 0]
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  })

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    )
  }

  // get user location on component mount
  const handleGetLocation = async () => {
    setLoading(true)
    let latitude: number | undefined
    let longitude: number | undefined

    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') {
      console.log('Location permission denied')
      ToastAndroid.show('Location permission denied', ToastAndroid.LONG)
      setLoading(false)
      return
    }

    const deviceLocation = await Location.getCurrentPositionAsync({})
    latitude = deviceLocation.coords.latitude
    longitude = deviceLocation.coords.longitude

    setUser({ ...user, location: [latitude, longitude] })
    ToastAndroid.show(
      'Location updated locally. Remember to save changes.',
      ToastAndroid.LONG
    )
    setLoading(false)
  }

  // update user data on server when userData changes
  const updateUserData = () => {
    if (!user.location[0] || !user.location[1]) {
      console.log('No location data to update')
      return
    }

    client
      .put('auth/me', user)
      .then(res => {
        console.log('User data update response:', res.data)
        ToastAndroid.show('User data updated successfully', ToastAndroid.LONG)
      })
      .catch(error => {
        ToastAndroid.show('Failed to update user data', ToastAndroid.LONG)
        console.log('User data update error:', error)
      })
  }

  // if loading show loading indicator
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* PROFILE IMAGE */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require('../../assets/avatar_m.avif')
            }
            style={styles.avatar}
          />
          <View style={styles.camera}>
            <Ionicons name='camera' size={16} color='#fff' />
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>{user.name || 'User'}</Text>
      </View>

      {/* BASIC DETAILS */}
      <SectionCard title='Basic Information'>
        <TextInput
          style={styles.input}
          value={user.name}
          onChangeText={val => setUser({ ...user, name: val })}
          placeholder='Full Name'
        />
        <TextInput
          style={styles.input}
          value={user.email}
          editable={false}
          placeholder='Email'
        />
        <TextInput
          style={styles.input}
          value={user.phone}
          onChangeText={val => setUser({ ...user, phone: val })}
          placeholder='Phone Number'
        />
        <TextInput
          style={styles.input}
          value={user.state}
          placeholder='State'
          editable={false}
        />
        <TextInput
          style={styles.input}
          value={user.lga}
          placeholder='Local Government'
          editable={false}
        />
        <Text style={styles.input}>
          Location: {user.location[0]}, {user.location[1]}
          {/* button to update location */}
          <TouchableOpacity onPress={handleGetLocation}>
            <Text style={styles.locBtn}>Update Location</Text>
          </TouchableOpacity>
        </Text>
        <TouchableOpacity style={styles.actionBtn} onPress={updateUserData}>
          <Ionicons name='save-outline' size={18} color={'white'} />
          <Text style={styles.actionText}>Save Changes</Text>
        </TouchableOpacity>
      </SectionCard>
      {/* CHANGE PASSWORD */}
      <SectionCard title='Change Password'>
        <TextInput
          style={styles.input}
          placeholder='Current Password'
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder='New Password'
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder='Confirm New Password'
          secureTextEntry
        />
        <TouchableOpacity style={styles.actionBtn} onPress={updateUserData}>
          <Ionicons name='save-outline' size={18} color={'white'} />
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>
      </SectionCard>
      {/* OPTIONAL INFO */}
      <SectionCard title='Additional Information (Optional)'>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder='Short bio (optional)'
          multiline
          value={user.bio}
          onChangeText={val => setUser({ ...user, bio: val })}
        />
        <TouchableOpacity style={styles.actionBtn} onPress={updateUserData}>
          <Ionicons name='save-outline' size={18} color={'white'} />
          <Text style={styles.actionText}>Update Bio</Text>
        </TouchableOpacity>
      </SectionCard>

      {/* NOTIFICATIONS */}
      <SectionCard title='Notification Preferences'>
        <ToggleRow
          label='Email Notifications'
          value={notifications.email}
          onChange={v => setNotifications({ ...notifications, email: v })}
        />
        <ToggleRow
          label='Push Notifications'
          value={notifications.push}
          onChange={v => setNotifications({ ...notifications, push: v })}
        />
        <ToggleRow
          label='SMS Notifications'
          value={notifications.sms}
          onChange={v => setNotifications({ ...notifications, sms: v })}
        />
        <TouchableOpacity style={styles.actionBtn} onPress={updateUserData}>
          <Ionicons name='save-outline' size={18} color={'white'} />
          <Text style={styles.actionText}>Save Preferences</Text>
        </TouchableOpacity>
      </SectionCard>

      {/* ACCOUNT ACTIONS */}
      <SectionCard title='Account'>
        <TouchableOpacity
          style={styles.actionBtnDanger}
          onPress={handleDeleteAccount}
        >
          <Ionicons name='trash-outline' size={18} color='#fff' />
          <Text style={[styles.actionText]}>Delete Account</Text>
        </TouchableOpacity>
      </SectionCard>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    padding: 16,
    marginBottom: 20
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55
  },

  camera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e90ff',
    borderRadius: 20,
    padding: 6
  },

  username: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700'
  },

  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#1e90ff',
    color: '#fff',
    paddingHorizontal: 12,
    borderRadius: 6
  },

  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#e74c3c',
    color: '#fff',
    paddingHorizontal: 12,
    borderRadius: 6
  },

  locBtn: {
    color: 'white',
    marginLeft: 10,
    fontSize: 14,
    backgroundColor: '#1e90ff',
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },

  actionText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold'
  }
})
