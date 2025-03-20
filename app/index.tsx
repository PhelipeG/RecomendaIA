import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

export default function App() {
  const navigateToRecommendations = () => {
    router.push("/recommendations");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recomenda IA</Text>
      <Image
        source={require("./assets/logo-home.png")}
        style={{ width: 250, height: 250, marginBottom: 40 }}
      />
      <Text style={styles.subtitle}>
        Descubra recomendações personalizadas de filmes e séries de TV usando a
        IA e pare de perder tempo procurando o que assistir.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={navigateToRecommendations}
      >
        <Text style={styles.buttonText}>Vamos Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingVertical: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#161515",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  button: {
    backgroundColor: "#a22307",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
