import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OnboardingItem {
  id: number;
  title: string;
  description: string;
  image: any;
}

// Componente separado para o item de onboarding
const OnboardingItemComponent = ({
  item,
  index,
  animationProgress,
}: {
  item: OnboardingItem;
  index: number;
  animationProgress: Animated.SharedValue<number>;
}) => {
  // Hook chamado no nível superior do componente funcional
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [index - 1, index, index + 1],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      animationProgress.value,
      [index - 1, index, index + 1],
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  }, []);

  return (
    <Animated.View style={[styles.itemContainer, animatedStyle]}>
      <Image
        source={item.image}
        style={styles.illustration}
        resizeMode="contain"
      />
      <Text style={styles.titleText}>{item.title}</Text>
      <Text style={styles.descriptionText}>{item.description}</Text>
    </Animated.View>
  );
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const animationProgress = useSharedValue(0);

  const onboardingData: OnboardingItem[] = [
    {
      id: 1,
      title: "Descubra o Futuro do Entretenimento",
      description:
        "Chega de perder horas procurando o que assistir! O Recomenda IA é seu novo assistente pessoal de filmes e séries.",
      image: require("../app/assets/onboardScreenImages/time-movie.png"),
    },
    {
      id: 2,
      title: "Recomendações Inteligentes",
      description:
        "Nosso sistema de IA analisa os melhores títulos premiados e populares para sugerir exatamente o que você vai adorar assistir.",
      image: require("../app/assets/onboardScreenImages/movie.png"),
    },
    {
      id: 3,
      title: "Sua Próxima Maratona Está Aqui!",
      description:
        "Encontre trailers, informações e os melhores filmes e séries do momento com apenas alguns toques. Vamos começar?",
      image: require("../app/assets/onboardScreenImages/diversao-logo.png"),
    },
  ];

  function handleNext() {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
      animationProgress.value = nextIndex;
    } else {
      router.push("/recommendations");
    }
  }
  function handlePrev() {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
    }
  }
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);

    if (index !== currentIndex) {
      setCurrentIndex(index);
      animationProgress.value = withTiming(index, { duration: 300 });
    }
  }
  // Função de renderização que usa o componente separado
  const renderOnboardingItem = ({
    item,
    index,
  }: {
    item: OnboardingItem;
    index: number;
  }) => {
    return (
      <OnboardingItemComponent
        item={item}
        index={index}
        animationProgress={animationProgress}
      />
    );
  };

  return (
    <>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <FlatList
            ref={flatListRef}
            data={onboardingData}
            renderItem={renderOnboardingItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            onMomentumScrollEnd={handleScroll}
            decelerationRate={"fast"}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />

          <View style={styles.controlContainer}>
            <View style={styles.dotsContainer}>
              {onboardingData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === currentIndex ? "#e22d36" : "#000",
                      width: index === currentIndex ? 26 : 10,
                    },
                  ]}
                />
              ))}
            </View>
            {/* botoes  */}
            <View style={styles.buttonContainer}>
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={styles.prevButton}
                  onPress={handlePrev}
                >
                  <Text style={styles.prevButtonText}>Anterior</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  currentIndex === onboardingData.length - 1
                    ? styles.startButton
                    : {},
                ]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {currentIndex === onboardingData.length - 1
                    ? "Começar"
                    : "Próximo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
  },
  safeArea: {
    flex: 1,
  },
  itemContainer: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 100,
  },
  illustration: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.4,
    marginBottom: 30,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000000",
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#000000",
    paddingHorizontal: 20,
  },
  controlContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "column",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: "#e22d36",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  startButton: {
    backgroundColor: "#",
    paddingHorizontal: 40,
  },
  prevButton: {
    backgroundColor: "#151313",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  prevButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
