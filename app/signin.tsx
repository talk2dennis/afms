import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ToastAndroid, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { Link } from "expo-router";
import colors from "../assets/colors";
import { useSession } from "./auth/context";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useSession();

  const handleLogin = () => {
    // handle login logic
    // check that all fields are filled
    if (!email || !password) {
        ToastAndroid.show("Please fill all fields", ToastAndroid.SHORT);
        return;
    }
    console.log("Login:", email, password);
    signIn();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
    <View style={styles.container}>
      <View>
        <Image source={require('../assets/afms_logo.png')} style={{width: 100, height: 100, alignSelf: 'center', marginVertical: 20}} />
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.gray}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.gray}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={{ color: colors.black }}>Don't have an account?</Text>
        <TouchableOpacity >
            <Link href="/register" asChild>
                <Text style={{ color: colors.secondary, marginLeft: 5 }}>Register</Text>
            </Link>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: colors.black,
  },
  input: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    color: colors.black
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold"
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24
  }
});
