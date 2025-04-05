import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function TabLayout() {
  // Calcular uma largura dinâmica baseada na largura da tela
  const tabBarWidth = SCREEN_WIDTH * 0.9; // 70% da largura da tela

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E22D36",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: {
          position: "absolute",
          bottom: 16,
          // Centralização precisa
          width: tabBarWidth,
          left: 0,
          right: 0,
          marginHorizontal: 20,
          borderRadius: 25,
          paddingTop: 5,
          backgroundColor: "#000",
          shadowColor: "#000",
          borderTopWidth: 0,
          height: 70,
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
        },
        tabBarItemStyle: {
          padding: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          paddingBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="recommendations/index"
        options={{
          title: "Recomendações",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="film" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saveds/index"
        options={{
          title: "Pesquisas Salvas",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="bookmark" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
