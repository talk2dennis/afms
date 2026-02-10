import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import SectionCard from '../components/sectionCard'
import ToggleRow from '../components/toggleRow'
import { useSession } from '../auth/context'

export default function SettingsPage () {
  const { userData, signOut } = useSession()

  const [profileImage, setProfileImage] = useState<string | null>(null)

  const [user, setUser] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    gsm: userData?.gsm || '',
    state: userData?.state || '',
    lga: userData?.lga || '',
    bio: '',
    location: userData?.location || { latitude: '--', longitude: '--' }
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
          value={user.gsm}
          onChangeText={val => setUser({ ...user, gsm: val })}
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
          Location: {user.location.latitude}, {user.location.longitude}
        </Text>
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
      </SectionCard>

      {/* ACCOUNT ACTIONS */}
      <SectionCard title='Account'>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name='create-outline' size={18} />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleDeleteAccount}
        >
          <Ionicons name='trash-outline' size={18} color='#e74c3c' />
          <Text style={[styles.actionText, { color: '#e74c3c' }]}>
            Delete Account
          </Text>
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
    gap: 10
  },

  actionText: {
    fontSize: 14
  }
})
