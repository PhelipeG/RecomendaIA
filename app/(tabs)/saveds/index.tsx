import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { loadSearchMovies } from "@/src/storage/loadSearchMovies";
import { useIsFocused } from "@react-navigation/native";
import EmptyList from "@/src/components/EmptyList";
import Loading from "@/src/components/Loading";

const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth * 0.85; // 85% da largura da tela

interface SavedItem {
  id: string;
  title: string;
  description?: string;
  poster?: string;
}

export default function Saveds() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    async function fetchSavedItems() {
      if (isFocused) {
        try {
          const items = await loadSearchMovies();
          console.log(items);
          setSavedItems(items);
        } catch (error) {
          Alert.alert("Erro", "Erro ao carregar os itens salvos.");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchSavedItems();
  }, [isFocused]);

  // Renderiza um item da lista como card
  const renderItem = ({ item }: { item: SavedItem }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>
            {item.title.substring(0, 6)}
          </Text>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.description && (
            <Text numberOfLines={3} style={styles.cardDescription}>
              {item.description}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            // Implementar função para remover item aqui
            Alert.alert(
              "Marcar como Assistido",
              `Deseja marcar como assistido o "${item.title}" da sua lista?`,
              [
                {
                  text: "Cancelar",
                  style: "cancel",
                },
                {
                  text: "Marcar como Assistido",
                  onPress: () => {
                    // Implementar lógica de remoção
                    const newItems = savedItems.filter(
                      (savedItem) => savedItem.id !== item.id
                    );
                    setSavedItems(newItems);
                    // Aqui você implementaria a atualização no AsyncStorage também
                  },
                  style: "destructive",
                },
              ]
            );
          }}
        >
          <Text style={styles.removeButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Itens Salvos</Text>
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={savedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item.title}
          contentContainerStyle={styles.list}
          ListEmptyComponent={EmptyList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 50,
    color: "#333",
  },
  list: {
    paddingVertical: 12,
    alignItems: "center",
    paddingBottom: 24,
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "center",
  },
  cardContent: {
    padding: 16,
    alignItems: "center", // Centralizar conteúdo
  },
  cardImage: {
    width: cardWidth * 0.8,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: cardWidth * 0.8,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  removeButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginTop: 8,
  },
  removeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
