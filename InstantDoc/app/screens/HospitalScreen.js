import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // Replace with your actual key

export default function HospitalScreen() {
    const [location, setLocation] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nearestHospital, setNearestHospital] = useState(null);
    const [distance, setDistance] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Allow location access to find hospitals.");
                return;
            }

            let userLocation = await Location.getCurrentPositionAsync({});
            setLocation(userLocation.coords);
            fetchHospitals(userLocation.coords.latitude, userLocation.coords.longitude);
        })();
    }, []);

    const fetchHospitals = async (latitude, longitude) => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=hospital&key=${GOOGLE_MAPS_API_KEY}`
            );

            const hospitalsData = response.data.results;
            setHospitals(hospitalsData);

            if (hospitalsData.length > 0) {
                findNearestHospital(latitude, longitude, hospitalsData);
            }
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        } finally {
            setLoading(false);
        }
    };

    const findNearestHospital = (userLat, userLng, hospitalsData) => {
        let minDistance = Infinity;
        let closestHospital = null;

        hospitalsData.forEach((hospital) => {
            const { lat, lng } = hospital.geometry.location;
            const dist = getDistance(userLat, userLng, lat, lng);

            if (dist < minDistance) {
                minDistance = dist;
                closestHospital = hospital;
            }
        });

        setNearestHospital(closestHospital);
        setDistance(minDistance.toFixed(2)); // Convert distance to 2 decimal places
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (angle) => (angle * Math.PI) / 180;
        const R = 6371; // Radius of Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in km
    };

    if (loading) return <ActivityIndicator size="large" color="blue" style={styles.loader} />;

    return (
        <View style={styles.container}>
            {location && (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    <Marker coordinate={location} title="Your Location" pinColor="blue" />
                    {hospitals.map((hospital, index) => (
                        <Marker
                            key={index}
                            coordinate={{
                                latitude: hospital.geometry.location.lat,
                                longitude: hospital.geometry.location.lng,
                            }}
                            title={hospital.name}
                            description={hospital.vicinity}
                        />
                    ))}
                </MapView>
            )}

            {nearestHospital && (
                <View style={styles.infoBox}>
                    <Text style={styles.hospitalName}>{nearestHospital.name}</Text>
                    <Text style={styles.hospitalDetails}>{nearestHospital.vicinity}</Text>
                    <Text style={styles.hospitalDistance}>Distance: {distance} km</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    infoBox: {
        backgroundColor: "white",
        padding: 15,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        position: "absolute",
        bottom: 0,
        width: "100%",
        alignItems: "center",
        elevation: 5,
    },
    hospitalName: { fontSize: 18, fontWeight: "bold" },
    hospitalDetails: { fontSize: 14, color: "gray" },
    hospitalDistance: { fontSize: 16, color: "#007bff", marginTop: 5 },
});
