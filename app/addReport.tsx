import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function AddReport() {
    return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>This is a modal screen</Text>
      {/* Dismiss the modal */}
      <Button onPress={() => router.back()} title="Dismiss" />
    </View>
  );
}