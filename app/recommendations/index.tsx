import React, { useState, SetStateAction } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Movie {
  title: string;
  year: string;
  genre: string;
  description: string;
  poster?: string;
  director?: string;
}

export default function RecommendationsScreen() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [error, setError] = useState(null);

  const GEMINI_API_KEY = "AIzaSyC45cGsSJ6NCpZOI6cZdXe5kL_fGe74tYY"; // Substitua com sua chave real
  const TMDB_API_KEY = "36cae9ed9297814856ee6da33b656fdf"; // Substitua com sua chave real
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const fetchMoviePoster = async (
    movieTitle: string | number | boolean,
    year: any
  ) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          movieTitle
        )}&year=${year}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].poster_path
          ? `${TMDB_IMAGE_BASE_URL}${data.results[0].poster_path}`
          : "https://via.placeholder.com/150x225?text=Sem+Imagem";
      }
      return "https://via.placeholder.com/150x225?text=Sem+Imagem";
    } catch (error) {
      console.error("Erro ao buscar poster:", error);
      return "https://via.placeholder.com/150x225?text=Sem+Imagem";
    }
  };

  async function getRecommendations() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Recomende 5 filmes baseados no seguinte critério: ${query}.
      Retorne apenas um JSON no formato:
      [
        {
          "title": "Nome do Filme",
          "year": "Ano",
          "genre": "Gênero",
          "description": "Breve descrição"
        }
      ]`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extrair o JSON da resposta
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const moviesWithoutPosters = JSON.parse(jsonString);

        // Buscar posters para cada filme
        const moviesWithPosters = await Promise.all(
          moviesWithoutPosters.map(async (movie: Movie) => {
            const posterUrl = await fetchMoviePoster(movie.title, movie.year);
            return { ...movie, poster: posterUrl };
          })
        );

        setRecommendations(moviesWithPosters as SetStateAction<Movie[]>);
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (err) {
      console.error(err);
      // setError("Erro ao buscar recomendações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const renderMovie = ({ item }: { item: Movie }) => (
    <View style={styles.movieCard}>
      <Image
        source={{ uri: item.poster }}
        style={styles.poster}
        defaultSource={{
          uri: "https://via.placeholder.com/150x225?text=Carregando",
        }}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.title}>
          {item.title} ({item.year})
        </Text>
        <Text style={styles.director}>Diretor: {item.director}</Text>
        <Text style={styles.genre}>Gênero: {item.genre}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Image
        source={require("../assets/logo.png")}
        style={{
          width: 150,
          height: 150,
          alignSelf: "center",
          marginBottom: 20,
        }}
      />
      <Text style={styles.header}>Recomenda IA</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ex: filmes de ação dos anos 90"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={getRecommendations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loading}
        />
      ) : (
        <FlatList
          data={recommendations}
          renderItem={renderMovie}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#cb1818",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderColor: "#e22323",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#060607",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loading: {
    marginTop: 50,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  movieCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  poster: {
    width: 100,
    height: 150,
  },
  movieInfo: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  director: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  genre: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  description: {
    fontSize: 13,
    color: "#444",
  },
});
