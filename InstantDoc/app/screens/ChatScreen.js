import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import axios from "axios";

export default function ChatScreen() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
        const response = await axios.post("http://192.168.1.7:3000/gemini", { prompt: input });
        console.log("Gemini API Response:", response.data); // ✅ Log response

        const botMessage = { sender: "bot", text: response.data.reply || "No response" };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
        console.error("Error fetching response:", error.response?.data || error.message);
        setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "Error getting response. Try again!" }]);
    }

    setInput("");
};

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.message, item.sender === "user" ? styles.userMessage : styles.botMessage]}>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask a first-aid question..." />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
    message: { padding: 10, borderRadius: 10, marginBottom: 10, maxWidth: "80%" },
    userMessage: { backgroundColor: "#007bff", alignSelf: "flex-end" },
    botMessage: { backgroundColor: "green", alignSelf: "flex-start" },
    messageText: { color: "white" },
    inputContainer: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "white" },
    input: { flex: 1, borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5 },
    sendButton: { backgroundColor: "#007bff", padding: 10, marginLeft: 10, borderRadius: 5 },
    sendButtonText: { color: "white", fontWeight: "bold" }
});
