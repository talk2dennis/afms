import * as Speech from "expo-speech";

export default function speak(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "en",
    rate: 0.95,
    pitch: 1.0,
  });
}
