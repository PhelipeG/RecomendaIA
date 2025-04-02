import { View, Text, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";

export default function EmptyList() {
  return (
    <View style={styles.emptyContainer}>
      <Feather name="x" size={80} color="red" />
      <Text style={styles.emptyText}>
        Você ainda não salvou nenhum filme ou série.
      </Text>
      <Text style={styles.emptySubtext}>
        Explore recomendações e salve seus favoritos!
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 0,
    paddingVertical: 24,
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
});
