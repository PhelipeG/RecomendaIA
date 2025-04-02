import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E22D36",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
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
