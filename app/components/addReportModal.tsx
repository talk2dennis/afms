import {
  Modal,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import statesLGAs from '../data/ng_st_lga'
import { useSession } from '../auth/context'
import createAxiosClient from '../api/axiosClient'

type Props = {
  visible: boolean
  onClose: () => void
}

export default function AddReportModal ({ visible, onClose }: Props) {
  const { userData } = useSession()
  const client = createAxiosClient(userData?.token || null)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedLga, setSelectedLga] = useState('')
  const [severity, setSeverity] = useState<'LOW' | 'MODERATE' | 'HIGH'>('LOW')
  const [images, setImages] = useState<
    {
      uri: string
      name: string
      type: string
    }[]
  >([])

  const lgaOptions = statesLGAs.find(s => s.state === selectedState)?.lgas || []
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5
    })

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset, index) => ({
        uri: asset.uri,
        name: asset.fileName || `report-${Date.now()}-${index}.jpg`,
        type: asset.mimeType || 'image/jpeg'
      }))

      setImages(prev => {
        const combined = [...prev, ...selectedImages].slice(0, 3)
        if (prev.length + selectedImages.length > 3) {
          ToastAndroid.show('Maximum of 3 images allowed', ToastAndroid.SHORT)
        }
        return combined
      })
    }
  }

  const handleSubmit = async () => {
    if (!title || !description || !selectedState || !selectedLga) {
      ToastAndroid.show('Please fill all required fields', ToastAndroid.SHORT)
      return
    }

    setLoading(true)

    const form = new FormData()
    form.append('title', title)
    form.append('description', description)
    form.append('state', selectedState)
    form.append('lga', selectedLga)
    form.append('severity', severity)
    form.append('longitude', '0')
    form.append('latitude', '0')

    images.forEach(image => {
      form.append('images', {
        uri: image.uri,
        name: image.name,
        type: image.type
      } as any)
    })

    client
      .post('reports', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(res => {
        ToastAndroid.show('Report submitted successfully', ToastAndroid.SHORT)
        setTitle('')
        setDescription('')
        setSelectedState('')
        setSelectedLga('')
        setSeverity('LOW')
        setImages([])
        onClose()
      })
      .catch(err => {
        console.error('Error submitting report:', err)
        ToastAndroid.show('Failed to submit report', ToastAndroid.SHORT)
      })
      .finally(() => setLoading(false))
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Modal visible={visible} animationType='slide' transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerText}>New Flood Report</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name='close' size={24} />
              </TouchableOpacity>
            </View>

            {/* Image Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Ionicons name='camera-outline' size={26} color='#555' />
              <Text style={{ marginTop: 6 }}>
                {images.length > 0
                  ? `Add More Images (${images.length} selected)`
                  : 'Add Images'}
              </Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((image, index) => (
                  <Image
                    key={`${image.uri}-${index}`}
                    source={{ uri: image.uri }}
                    style={styles.imageThumb}
                  />
                ))}
              </ScrollView>
            )}

            {/* Inputs */}
            <TextInput
              placeholder='Title'
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              placeholder='Description'
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Severity Picker */}
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={severity} onValueChange={setSeverity}>
                <Picker.Item label='Low' value='LOW' />
                <Picker.Item label='Moderate' value='MODERATE' />
                <Picker.Item label='High' value='HIGH' />
              </Picker>
            </View>

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

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.submitLoadingRow}>
                  <ActivityIndicator color='#fff' size='small' />
                  <Text style={styles.submitText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },

  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },

  headerText: {
    fontSize: 18,
    fontWeight: '700'
  },

  input: {
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },

  submitBtn: {
    backgroundColor: '#1e90ff',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 10
  },

  submitBtnDisabled: {
    opacity: 0.7
  },

  submitLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },

  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15
  },
  imagePicker: {
    backgroundColor: '#f2f4f7',
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12
  },

  imagePreview: {
    height: '100%',
    width: '100%',
    borderRadius: 12,
    marginVertical: 10
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 10
  },
  pickerWrapper: {
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    marginBottom: 12
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
