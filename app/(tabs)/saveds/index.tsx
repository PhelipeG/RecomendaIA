import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  StatusBar,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { loadSearchMovies } from "@/src/storage/loadSearchMovies";
import { useIsFocused } from "@react-navigation/native";
import EmptyList from "@/src/components/EmptyList";
import Loading from "@/src/components/Loading";
import { removeSearchMovies } from "@/src/storage/removeSearchMovie";

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

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const items = await loadSearchMovies();
      console.log("Itens carregados:", items);
      setSavedItems(items);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      Alert.alert("Erro", "Erro ao carregar os itens salvos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadItems();
    }
  }, [isFocused, loadItems]);

  // Função para remover itens que atualiza a lista após remoção
  const handleRemoveItem = async (id: string) => {
    try {
      const updatedItems = await removeSearchMovies(id);
      // Atualizar diretamente o estado com os itens retornados da função
      setSavedItems(updatedItems);
    } catch (error) {
      console.error("Erro ao remover item:", error);
      Alert.alert("Erro", "Não foi possível remover o item.");
      // Recarregar em caso de erro
      loadItems();
    }
  };

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
                  onPress: () => handleRemoveItem(item.id),
                  style: "destructive",
                },
              ]
            );
          }}
        >
          <Text style={styles.removeButtonText}>Marcar como Assistido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ca1414" barStyle="light-content" />
      <View style={styles.headerSaved}>
        <View style={styles.dropEffect}></View>
        <Text style={styles.headerText}>Meus Filmes Salvos</Text>
      </View>

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={savedItems}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          extraData={savedItems.length} // Para forçar a atualização da lista
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
  },
  headerSaved: {
    width: "100%", // Reduzir a largura para permitir bordas arredondadas
    height: 150, // Altura do cabeçalho
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ca1414",
    borderBottomLeftRadius: 35, // Mais arredondado embaixo à esquerda
    borderBottomRightRadius: 35, // Mais arredondado embaixo à direita
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    // Efeito de gota
    // transform: [{ scaleY: 0.95 }], // Leve achatamento vertical
    borderWidth: 0,
    borderColor: "#be1919",
    position: "relative",
    overflow: "hidden",
    marginTop: 0, // Remover margem superior
  },
  dropEffect: {
    position: "absolute",
    width: "150%",
    height: 80, // Aumentei altura do efeito
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Cor mais sutil
    borderRadius: 100,
    bottom: -40, // Posicionado na parte inferior
    alignSelf: "center",
    transform: [{ scaleX: 1.5 }], // Alongar horizontalmente
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    // Remover margens porque agora usamos padding do container
    marginBottom: 0,
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
  },
  list: {
    paddingVertical: 12,
    alignItems: "center",
    paddingBottom: 24,
    paddingHorizontal: 16,
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
