import React from "react";
import { Modal, View, Image, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import statesLGAs from "../data/ng_st_lga";

type Props = {
  visible: boolean;
  onClose: () => void;
  addReport: (data:{title: string; description: string; state: string; lga: string; img: string;}) => void;
};

export default function AddReportModal({ visible, onClose, addReport }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [image, setImage] = useState<string | null>(null);


  const lgaOptions =
    statesLGAs.find(s => s.state === selectedState)?.lgas || [];
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!title || !description || !selectedState || !selectedLga) return;

    addReport({ title, description, state: selectedState, lga: selectedLga, img: image || "" });

    // reset
    setTitle("");
    setDescription("");
    setSelectedState("");
    setSelectedLga("");
    setImage(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>New Flood Report</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          {/* Image Picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={26} color="#555" />
                <Text style={{ marginTop: 6 }}>Add Image</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Inputs */}
          <TextInput
            placeholder="Title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            placeholder="Description"
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* State Picker */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedState}
              onValueChange={(value) => {
                setSelectedState(value);
                setSelectedLga("");
              }}
            >
              <Picker.Item label="Select State" value="" />
              {statesLGAs.map((s) => (
                <Picker.Item key={s.alias} label={s.state} value={s.state} />
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
              <Picker.Item label="Select LGA" value="" />
              {lgaOptions.map((lga) => (
                <Picker.Item key={lga} label={lga} value={lga} />
              ))}
            </Picker>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  headerText: {
    fontSize: 18,
    fontWeight: "700",
  },

  input: {
    backgroundColor: "#f2f4f7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  submitBtn: {
    backgroundColor: "#1e90ff",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  imagePicker: {
    backgroundColor: "#f2f4f7",
    height: 150,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  imagePreview: {
    height: "100%",
    borderRadius: 12,
    marginVertical: 10,
  },
  pickerWrapper: {
    backgroundColor: "#f2f4f7",
    borderRadius: 12,
    marginBottom: 12,
  },
});
