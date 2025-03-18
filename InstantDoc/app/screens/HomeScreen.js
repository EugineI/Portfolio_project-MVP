import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity, Linking
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function HomeScreen() {
    const [contacts, setContacts] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [user_id, setUserId] = useState(null);

    // Fetch stored user ID when component mounts
    useEffect(() => {
        const fetchUserId = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                const { id } = JSON.parse(storedUser);
                setUserId(id);
                fetchContacts(id);
            }
        };
        fetchUserId();
    }, []);

    // Fetch saved contacts from the backend
    const fetchContacts = async (id) => {
        try {
            const response = await axios.get(`http://192.168.1.5:8081/contacts/${id}`);
            setContacts(response.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    // Save new contact to the database
    const addContact = async () => {
        if (!name || !phone) {
            Alert.alert("Error", "Please enter both name and phone number.");
            return;
        }

        if (!user_id) {
            Alert.alert("Error", "User ID is missing");
            return;
        }

        if (contacts.length >= 4) {
            Alert.alert("Limit Reached", "You can only add up to 4 emergency contacts.");
            return;
        }

        try {
            const response = await axios.post("http://192.168.1.5:8081/contacts", { user_id, name, phone });
            setContacts([...contacts, { id: response.data.id, name, phone }]);
            setName("");
            setPhone("");
        } catch (error) {
            console.error("Error saving contact:", error);
            Alert.alert("Error", "Could not save contact.");
        }
    };

    // Function to delete a contact with confirmation
    const confirmDelete = (id) => {
    console.log("Confirm Delete ID:", id); // Debugging line
    Alert.alert(
        "Delete Contact",
        "Are you sure you want to delete this contact?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteContact(id) }
        ]
    );
};
  //delete function
const deleteContact = async (id) => {
    console.log(`Attempting to delete contact with ID: ${id}`);

    if (!id) {
        Alert.alert("Error", "Invalid contact ID.");
        return;
    }

    try {
        const response = await axios.delete(`http://192.168.1.5:8081/contacts/${id}`);
        console.log("Delete response:", response.data);

        // Update the state safely
        setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== id));
    } catch (error) {
        console.error("Error deleting contact:", error.response ? error.response.data : error.message);
        Alert.alert("Error", error.response?.data?.message || "Could not delete contact.");
    }
};

const callContact = (phone) => {
        Linking.openURL(`tel:${phone}`);
};
return (
        <View style={styles.container}>
            <Text style={styles.title}>Emergency Contacts</Text>

            {/* Input fields */}
            <TextInput
                style={styles.input}
                placeholder="Enter Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter Phone Number"
                keyboardType="numeric"
                value={phone}
                onChangeText={setPhone}
            />
            <TouchableOpacity style={styles.addButton} onPress={addContact}>
                <Text style={styles.addButtonText}>Add Contact</Text>
            </TouchableOpacity>

            {/* Display Contacts */}
            {contacts.length === 0 ? (
                <Text style={styles.noContacts}>No emergency contacts added yet.</Text>
            ) : (
                <FlatList
                    data={contacts}
                    keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                    renderItem={({ item }) => (
                        <View style={styles.contactBox}>
                            <Text style={styles.contactText}>📞 {item.name} - {item.phone}</Text>

                            <View style={styles.buttonGroup}>
                                <TouchableOpacity style={styles.callButton} onPress={() => callContact(item.phone)}>
                                    <Text style={styles.callButtonText}>Call</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
                                    <Text style={styles.deleteButtonText}>X</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Emergency Call Buttons */}
            <TouchableOpacity style={styles.emergencyButton} onPress={() => callContact("999")}>
                <Text style={styles.emergencyButtonText}>🚨 Call Emergency (999)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.emergencyButton} onPress={() => callContact("121")}>
                <Text style={styles.emergencyButtonText}>🚑 Call Ambulance (121)</Text>
            </TouchableOpacity>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#d32f2f" },
    input: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
        borderColor: "#ccc"
    },
    addButton: {
        backgroundColor: "#28a745",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 15
    },
    addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    noContacts: { marginTop: 20, fontStyle: "italic", textAlign: "center", color: "#888" },
    contactBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 10
    },
    contactText: { fontSize: 16, fontWeight: "500" },
    buttonGroup: { flexDirection: "row", gap: 10 },
    callButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5 },
    callButtonText: { color: "#fff", fontWeight: "bold" },
    deleteButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5 },
    deleteButtonText: { color: "#fff", fontWeight: "bold" },
    emergencyButton: { backgroundColor: "#d32f2f", padding: 15, marginTop: 20, borderRadius: 8, alignItems: "center" },
    emergencyButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});
