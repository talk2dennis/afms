import { Text, View, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import colors from "../assets/colors";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const MOCK_CODE = "123456";

  const sendCode = () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    // 🔒 Mock email sending
    Alert.alert("Code Sent", "A 6-digit code has been sent to your email");
    setStep(2);
  };

  const verifyCode = () => {
    if (code.length !== 6) {
      Alert.alert("Invalid Code", "Code must be 6 digits");
      return;
    }

    if (code !== MOCK_CODE) {
      Alert.alert("Incorrect Code", "The code you entered is incorrect");
      return;
    }

    setStep(3);
  };

  const resetPassword = () => {
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match");
      return;
    }

    Alert.alert("Success", "Password has been reset successfully");
    // 🔁 navigate to login later
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {step === 1 && (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.text}>Enter your email to receive a code</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={sendCode}>
              <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Verify Code</Text>
            <Text style={styles.text}>Enter the 6-digit code sent to your email</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter code"
              placeholderTextColor={colors.gray}
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              maxLength={6}
            />

            <TouchableOpacity style={styles.button} onPress={verifyCode}>
              <Text style={styles.buttonText}>Verify Code</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.title}>Reset Password</Text>

            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={colors.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={colors.gray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={resetPassword}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  text: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    color: colors.black,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
