import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
	<Image source={require("../../assets/images/logo.png")} style={styles.logo} />
      {/* Title & Subtitle */}
      <Text style={styles.title}>Welcome to InstantDoc</Text>
      <Text style={styles.subtitle}>Your emergency first aid assistant</Text>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Register Section */}
      <Text style={styles.text}>New here?</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Create an Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d32f2f", // Red for first aid
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  registerText: {
    fontSize: 16,
    color: "#d32f2f",
    fontWeight: "bold",
    marginTop: 5,
  },
});

export default LandingScreen;

