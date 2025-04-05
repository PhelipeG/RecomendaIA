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

    // Truncar a descrição se for muito longa
    const truncatedDescription =
      item.description.length > 150
        ? item.description.substring(0, 150) + "..."
        : item.description;

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
            <Text style={styles.title} numberOfLines={1}>
              {item.title} ({item.year})
            </Text>
            <Text style={styles.description} numberOfLines={4}>
              {truncatedDescription}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.trailerButton}
              onPress={() => handleTrailerPress(item)}
            >
              <Text style={styles.buttonText}>Ver trailer</Text>
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
        snapToInterval={CARD_WIDTH}
        bounces={false}
        contentContainerStyle={styles.flatListContent}
        snapToAlignment="center"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
      />

      {/* Indicadores de página */}
      <View style={[styles.indicatorContainer, { marginBottom: 140 }]}>
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
    paddingHorizontal: (widthScreen - CARD_WIDTH) / 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 350, // Altura fixa menor para os cards
    alignItems: "center",
    justifyContent: "center",
  },
  movieCard: {
    width: "100%",
    height: "100%",
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 20,
  },
  poster: {
    width: "100%",
    height: 160, // Altura fixa menor para o poster
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  fallbackPoster: {
    width: "100%",
    height: 160, // Mesma altura do poster
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
  movieInfo: {
    padding: 12,
    flex: 1, // Permite que a seção de informações ocupe o espaço entre o poster e o botão
  },
  buttonContainer: {
    padding: 12,
    paddingTop: 0,
    width: "100%",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#DDD",
    flex: 1,
  },
  trailerButton: {
    backgroundColor: "#e50914",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "center",
    width: "100%",
    alignItems: "center", // Centraliza o texto no botão
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#e50914",
    marginHorizontal: 4,
  },
});
