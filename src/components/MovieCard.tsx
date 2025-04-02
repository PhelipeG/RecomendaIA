import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Movie } from "../dtos/MovieDto";
import { useRouter } from "expo-router";

const { width: widthScreen } = Dimensions.get("window");
// Defina uma largura de card consistente
const CARD_WIDTH = widthScreen * 0.8; // 20px de margem em cada lado

interface MovieCardsProps {
  data: Movie[];
}

export default function MovieCards({ data }: MovieCardsProps) {
  const router = useRouter();
  const scrollX = React.useRef(new Animated.Value(0)).current;

  function handleTrailerPress(item: Movie) {
    router.push({
      pathname: "/trailerMovie",
      params: {
        title: item.title,
        year: item.year,
        description: item.description,
        searchQuery: `${item.title} ${item.year} trailer oficial`,
      },
    });
  }

  const renderItem = ({ item, index }: { item: Movie; index: number }) => {
    // Verificar se a imagem do pôster é válida
    const isPosterError =
      !item.poster ||
      item.poster.includes("Sem+Imagem") ||
      item.poster.includes("Erro") ||
      item.poster.includes("Cancelado");

    // Cálculo de animação para escala e opacidade
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[styles.cardContainer, { transform: [{ scale }], opacity }]}
      >
        <View style={styles.movieCard}>
          {isPosterError ? (
            // Fallback para quando a imagem não carregar
            <View style={styles.fallbackPoster}>
              <Text style={styles.fallbackIcon}>{item.title.charAt(0)}</Text>
              <Text style={styles.fallbackText}>Sem Imagem</Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.poster }}
              style={styles.poster}
              defaultSource={{
                uri: "https://via.placeholder.com/150x225?text=Carregando",
              }}
              resizeMode="cover"
            />
          )}
          <View style={styles.movieInfo}>
            <Text style={styles.title}>
              {item.title} ({item.year})
            </Text>
            <Text style={styles.description}>{item.description}</Text>
            <TouchableOpacity
              style={styles.trailerButton}
              onPress={() => handleTrailerPress(item)}
            >
              <Text style={styles.trailerButtonText}>Ver trailer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => `movie-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate={0.8}
        // Usar o mesmo valor para snapToInterval e espaçamento
        snapToInterval={CARD_WIDTH}
        bounces={false}
        // Ajuste correto do contentContainerStyle
        contentContainerStyle={styles.flatListContent}
        snapToAlignment="center"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        // Remover contentInset que pode causar problemas em algumas versões do React Native
        // contentInset={{ left: 20, right: 20 }}
        contentInsetAdjustmentBehavior="automatic"
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
      />

      {/* Indicadores de página */}
      <View style={styles.indicatorContainer}>
        {data.map((_, index) => {
          const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            (index + 1) * CARD_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.5, 1],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={`indicator-${index}`}
              style={[styles.indicator, { transform: [{ scale }], opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    // Fórmula corrigida para centralizar os cards
    paddingHorizontal: (widthScreen - CARD_WIDTH) / 2,
  },
  cardContainer: {
    // Usar a mesma largura definida na constante
    width: CARD_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  movieCard: {
    width: "100%",
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  poster: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  // Estilo para o fallback quando a imagem não carrega
  fallbackPoster: {
    width: "100%",
    height: 200,
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackIcon: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#E22D36",
  },
  fallbackText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  movieInfo: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#DDD",
    marginBottom: 12,
  },
  trailerButton: {
    backgroundColor: "#e50914", // Cor estilo Netflix
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "center",
    marginTop: 4,
    width: "100%",
  },
  trailerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  indicator: {
    height: 8,
    width: 8, // Defina uma largura base
    borderRadius: 4,
    backgroundColor: "#e50914",
    marginHorizontal: 4,
  },
});
