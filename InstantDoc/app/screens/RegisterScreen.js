import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Keyboard, 
  TouchableWithoutFeedback, StyleSheet 
} from "react-native";
import axios from "axios";

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Validate Email Format
    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleRegister = () => {
        Keyboard.dismiss();
        if (!name || !email || !password) {
            Alert.alert("Error", "All fields are required!");
            return;
        }
        if (!isValidEmail(email)) {
            Alert.alert("Error", "Enter a valid email address!");
            return;
        }

        setLoading(true);
        axios.post("http://192.168.1.5:8081/register", { name, email, password })
            .then(response => {
                Alert.alert("Success", "Registration successful!");
                navigation.navigate("Login");
            })
            .catch(error => {
                Alert.alert("Error", error.response?.data?.error || "Something went wrong");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}>Create Account</Text>

                <TextInput 
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />

                <TextInput 
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                />

                <TextInput 
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleRegister} 
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.loginText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#d32f2f",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: "#f9f9f9",
    },
    button: {
        backgroundColor: "#d32f2f",
        paddingVertical: 12,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
        marginBottom: 15,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    loginText: {
        fontSize: 16,
        color: "#d32f2f",
        fontWeight: "bold",
    },
});


