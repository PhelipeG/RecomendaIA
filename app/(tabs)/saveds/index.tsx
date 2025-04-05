import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { loadSearchMovies } from "@/src/storage/loadSearchMovies";
import { useIsFocused } from "@react-navigation/native";
import EmptyList from "@/src/components/EmptyList";
import Loading from "@/src/components/Loading";
import { removeSearchMovies } from "@/src/storage/removeSearchMovie";
import Header from "@/src/components/Header";
import { useRouter } from "expo-router";
import { Movie } from "@/src/dtos/MovieDto";

const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth * 0.85; // 85% da largura da tela

// Interface para representar uma lista salva completa
interface SavedMovieList {
  id: string;
  date: string;
  title: string;
  movies: Movie[];
}

export default function Saveds() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [savedLists, setSavedLists] = useState<SavedMovieList[]>([]);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const lists = await loadSearchMovies();
      console.log("Listas carregadas:", lists);
      setSavedLists(lists);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
      Alert.alert("Erro", "Erro ao carregar as listas salvas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadItems();
    }
  }, [isFocused, loadItems]);

  // Função para remover uma lista completa
  const handleRemoveList = async (id: string) => {
    try {
      await removeSearchMovies(id);
      // Atualiza o estado filtrando a lista removida localmente
      setSavedLists((currentLists) =>
        currentLists.filter((list) => list.id !== id)
      );
    } catch (error) {
      console.error("Erro ao remover lista:", error);
      Alert.alert("Erro", "Não foi possível remover a lista.");
      loadItems();
    }
  };

  // Navegar para a tela de detalhes da lista quando clicar
  const handleListPress = (list: SavedMovieList) => {
    router.push({
      pathname: "/listDetails",
      params: {
        listId: list.id,
        title: list.title,
      },
    });
  };

  // Renderiza uma lista salva como card
  const renderCard = (item: SavedMovieList) => {
    // Pegamos a primeira imagem da lista para usar como miniatura
    const thumbnailPoster =
      item.movies && item.movies.length > 0 && item.movies[0].poster
        ? item.movies[0].poster
        : null;

    // Total de filmes na lista
    const moviesCount = item.movies?.length || 0;

    // Formata a data para exibição
    const listDate = new Date(item.date).toLocaleDateString("pt-BR");

    return (
      <View style={styles.cardContainer} key={item.id}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleListPress(item)}
        >
          {thumbnailPoster ? (
            <Image
              source={{ uri: thumbnailPoster }}
              style={styles.cardImage}
              defaultSource={{
                uri: "https://via.placeholder.com/150x225?text=Carregando",
              }}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{item.title.charAt(0)}</Text>
            </View>
          )}

          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>
              {moviesCount} {moviesCount === 1 ? "filme" : "filmes"} • Salvo em{" "}
              {listDate}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              Alert.alert(
                "Remover Lista",
                `Deseja remover a lista "${item.title}"?`,
                [
                  {
                    text: "Cancelar",
                    style: "cancel",
                  },
                  {
                    text: "Remover",
                    onPress: () => handleRemoveList(item.id),
                    style: "destructive",
                  },
                ]
              );
            }}
          >
            <Text style={styles.removeButtonText}>Remover Lista</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#c1071e" barStyle="light-content" />
      <Header title="Minhas Listas" />

      {loading ? (
        <Loading />
      ) : savedLists.length === 0 ? (
        <EmptyList />
      ) : (
        <ScrollView
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          decelerationRate="fast"
          snapToInterval={cardWidth + 5}
          snapToAlignment="center"
        >
          {savedLists.map(renderCard)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollViewContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 10,
  },
  cardContainer: {
    width: cardWidth - 20,
    marginHorizontal: 8,
    height: 350,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
    alignItems: "center",
  },
  cardImage: {
    width: cardWidth * 0.5,
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: cardWidth * 0.5,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#999",
  },
  cardDetails: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  removeButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginTop: 12,
  },
  removeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E22D36",
    marginHorizontal: 4,
  },
});
