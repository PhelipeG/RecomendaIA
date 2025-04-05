import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Movie } from "@/src/dtos/MovieDto";
import { getSavedMovieLists } from "@/src/storage/saveSearchFilm";
import Loading from "@/src/components/Loading";
import Header from "@/src/components/Header";
import MovieCards from "@/src/components/MovieCard";
import EmptyList from "@/src/components/EmptyList";

const screenWidth = Dimensions.get("screen").width;

export default function ListDetailsScreen() {
  const router = useRouter();
  const { listId, title } = useLocalSearchParams<{
    listId: string;
    title: string;
  }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListMovies() {
      try {
        setLoading(true);
        const allLists = await getSavedMovieLists();
        const selectedList = allLists.find((list) => list.id === listId);

        if (selectedList && selectedList.movies) {
          setMovies(selectedList.movies);
        } else {
          setError("Lista não encontrada");
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes da lista:", err);
        setError("Erro ao carregar a lista");
      } finally {
        setLoading(false);
      }
    }

    loadListMovies();
  }, [listId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#c1071e" barStyle="light-content" />
      <Header title={title} />

      {loading ? (
        <Loading />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {movies.length === 0 ? <EmptyList /> : <MovieCards data={movies} />}
        </View>
      )}
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
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
