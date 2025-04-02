import Header from "@/src/components/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";

const screenWidth = Dimensions.get("screen").width;

export default function TrailerMovie() {
  const router = useRouter();
  // Obter os parâmetros da rota ex: /trailerMovie?movieId=1
  const params = useLocalSearchParams();

  // Obter os valores dos parâmetros
  const { title, year, searchQuery, description } = params;

  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para carregar um novo vídeo
  async function searchTrailerOnYouTube() {
    if (!searchQuery) return;

    try {
      setLoading(true);

      // Construímos uma URL de busca do YouTube para encontrar o trailer
      const encodedSearchQuery = encodeURIComponent(searchQuery as string);
      const searchUrl = `https://www.youtube.com/results?search_query=${encodedSearchQuery}`;

      // Buscar a página de resultados do YouTube
      const response = await fetch(searchUrl);
      const html = await response.text();

      // Extrair o primeiro vídeo dos resultados
      const videoIdMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);

      if (videoIdMatch && videoIdMatch[1]) {
        // Configuramos o URL do vídeo encontrado
        setVideoUrl(`https://www.youtube.com/embed/${videoIdMatch[1]}`);
      } else {
        // Configuramos um URL de busca genérico para o usuário ver os resultados
        setVideoUrl(
          `https://www.youtube.com/results?search_query=${encodedSearchQuery}`
        );
      }
    } catch (error) {
      console.error("Erro ao buscar trailer:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (searchQuery) {
      searchTrailerOnYouTube();
    }
  }, [searchQuery]);

  const renderVideoPlayer = () => {
    return (
      <WebView
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        source={{ uri: videoUrl }}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={() => setLoading(false)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#c1071e" barStyle="light-content" />
      <Header title={title} />
      <View style={styles.videoContainer}>
        {renderVideoPlayer()}
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Carregando trailer...</Text>
          </View>
        )}
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          {description} - {year}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonBack}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonBackText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    fontSize: 20,
    marginVertical: 16,
    fontWeight: "bold",
    color: "#e22d36",
    textAlign: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  videoContainer: {
    height: 240,
    marginTop: -40,
    marginVertical: 20,
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: "#fff",
    borderWidth: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  webView: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },
  button: {
    width: 100,
    height: 48,
    backgroundColor: "#e22d36",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  helpContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#e22d36",
  },
  helpText: {
    fontSize: 14,
    color: "#e22d36",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  buttonBack: {
    backgroundColor: "#0d0c0c",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 10,
    width: screenWidth - 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBackText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
