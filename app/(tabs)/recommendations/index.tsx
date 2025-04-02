import React, { useState, SetStateAction, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Movie } from "../../../src/dtos/MovieDto";
import Loading from "../../../src/components/Loading";
import Constants from "expo-constants";
import Moviecard from "@/src/components/MovieCard";
import { saveSearchMovies } from "@/src/storage/saveSearchFilm";

const screenWidth = Dimensions.get("screen").width;

export default function RecommendationsScreen() {
  const [loading, setLoading] = useState(false);
  const [posterLoading, setPosterLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [posterCache, setPosterCache] = useState<Record<string, string>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;
  const TMDB_API_KEY = Constants.expoConfig?.extra?.TMDB_API_KEY;
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  async function saveMovieToList() {
    setIsSaving(true);
    try {
      await saveSearchMovies(recommendations);
      Alert.alert("Sucesso", "Lista de filmes salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar filme:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function fetchMoviePoster(
    movieTitle: string | number | boolean,
    year: string | number,
    signal?: AbortSignal
  ) {
    const cacheKey = `${movieTitle}-${year}`;

    if (posterCache[cacheKey]) {
      return posterCache[cacheKey];
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          movieTitle
        )}&year=${year}&include_adult=false&language=pt-BR&page=1`,
        { signal }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const posterUrl = data.results[0].poster_path
          ? `${TMDB_IMAGE_BASE_URL}${data.results[0].poster_path}`
          : "https://via.placeholder.com/150x225?text=Sem+Imagem";

        setPosterCache((prev) => ({
          ...prev,
          [cacheKey]: posterUrl,
        }));

        return posterUrl;
      }

      const fallbackResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          movieTitle
        )}&include_adult=false&language=pt-BR&page=1`,
        { signal }
      );

      const fallbackData = await fallbackResponse.json();

      if (fallbackData.results && fallbackData.results.length > 0) {
        const posterUrl = fallbackData.results[0].poster_path
          ? `${TMDB_IMAGE_BASE_URL}${fallbackData.results[0].poster_path}`
          : "https://via.placeholder.com/150x225?text=Sem+Imagem";

        setPosterCache((prev) => ({
          ...prev,
          [cacheKey]: posterUrl,
        }));

        return posterUrl;
      }

      return "https://via.placeholder.com/150x225?text=Sem+Imagem";
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Busca de pôster cancelada");
        return "https://via.placeholder.com/150x225?text=Cancelado";
      }

      console.error("Erro ao buscar poster:", error);
      return "https://via.placeholder.com/150x225?text=Erro";
    }
  }

  async function fetchMoviePostersInBatches(moviesWithIDs: Movie[]) {
    if (!moviesWithIDs.length) return [];

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setPosterLoading(true);

    try {
      const moviePosters = [...moviesWithIDs];
      const batchSize = 3;

      for (let i = 0; i < moviesWithIDs.length; i += batchSize) {
        if (signal.aborted) break;

        const batch = moviesWithIDs.slice(i, i + batchSize);

        const posterPromises = batch.map((movie, batchIndex) =>
          fetchMoviePoster(movie.title, movie.year, signal).then((poster) => ({
            index: i + batchIndex,
            poster,
            id: movie.id,
          }))
        );

        const posterResults = await Promise.all(posterPromises);

        posterResults.forEach(({ index, poster, id }) => {
          if (index < moviePosters.length) {
            moviePosters[index] = {
              ...moviePosters[index],
              poster,
            };
          }
        });

        if (!signal.aborted) {
          console.log("Atualizando filmes com pôsteres:", moviePosters);
          setRecommendations([...moviePosters]);
        }
      }

      return moviePosters;
    } catch (error) {
      console.error("Erro ao buscar pôsteres em lote:", error);
      return recommendations;
    } finally {
      setPosterLoading(false);
    }
  }

  const getRecommendations = useCallback(async () => {
    if (!query.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const prompt = `Recomende 8 filmes baseados no seguinte critério: ${query} e que sejam dos anos recentes.
      Retorne apenas um JSON no formato:
      [
        {
          "title": "Nome do Filme",
          "year": "Ano",
          "description": "Breve descrição"
        }
      ]`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Tempo esgotado ao buscar recomendações")),
          15000
        )
      );

      const aiPromise = model.generateContent(prompt);

      const result = await Promise.race([aiPromise, timeoutPromise]);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const moviesData = JSON.parse(jsonString);

        const moviesWithIDs = moviesData.map((movie: any) => ({
          ...movie,
          id: `movie-${Math.random().toString(36).substring(2, 15)}`,
          poster: "https://via.placeholder.com/150x225?text=Carregando",
        }));

        setRecommendations(moviesWithIDs);
        console.log("Filmes com IDs gerados:", moviesWithIDs);
        setLoading(false);

        await fetchMoviePostersInBatches(moviesWithIDs);
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Erro ao buscar recomendações");
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Text style={styles.header}>Recomenda IA</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ex:filmes de ação dos anos 90"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={getRecommendations}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading ? styles.buttonDisabled : null]}
            onPress={getRecommendations}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Buscando..." : "Buscar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={saveMovieToList}
            style={[
              styles.buttonSaveList,
              isSaving ? styles.buttonDisabled : null,
            ]}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>
              {isSaving ? "Salvando..." : "Salvar Lista"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {posterLoading && recommendations.length > 0 && (
        <View style={styles.posterLoadingContainer}>
          <ActivityIndicator size="small" color="#E22D36" />
          <Text style={styles.posterLoadingText}>Carregando imagens...</Text>
        </View>
      )}

      {loading ? <Loading /> : <Moviecard data={recommendations} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#E22D36",
  },
  inputContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: screenWidth - 40,
    marginRight: 10,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: screenWidth - 40,
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#E22D36",
    height: 50,
    width: (screenWidth - 50) / 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: "#7a1821",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonSaveList: {
    backgroundColor: "#4bf617",
    height: 50,
    width: (screenWidth - 50) / 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  error: {
    color: "#E22D36",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
  posterLoadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
  },
  posterLoadingText: {
    color: "#999",
    marginLeft: 8,
    fontSize: 14,
  },
});
