import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import Constants from "expo-constants";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

export default function HospitalScreen() {
    const [location, setLocation] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [nearestHospital, setNearestHospital] = useState(null);
    const [loading, setLoading] = useState(true);

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
            const hospitalList = response.data.results;
            setHospitals(hospitalList);
            findNearestHospital(latitude, longitude, hospitalList);
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        } finally {
            setLoading(false);
        }
    };

    const findNearestHospital = (userLat, userLng, hospitalList) => {
        if (!hospitalList.length) return;

        let nearest = null;
        let minDistance = Number.MAX_VALUE;

        hospitalList.forEach(hospital => {
            const hospitalLat = hospital.geometry.location.lat;
            const hospitalLng = hospital.geometry.location.lng;
            const distance = getDistance(userLat, userLng, hospitalLat, hospitalLng);

            if (distance < minDistance) {
                minDistance = distance;
                nearest = { name: hospital.name, distance: minDistance.toFixed(2) };
            }
        });

        setNearestHospital(nearest);
    };

    // Haversine formula to calculate distance between two lat/lng points
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
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

            {/* Display nearest hospital information */}
            {nearestHospital && (
                <View style={styles.nearestContainer}>
                    <Text style={styles.nearestText}>
                        Nearest Hospital: {nearestHospital.name}
                    </Text>
                    <Text style={styles.nearestText}>
                        Distance: {nearestHospital.distance} km
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    nearestContainer: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
        alignItems: "center",
    },
    nearestText: { fontSize: 16, fontWeight: "bold" },
});


