import { View, Text, StyleSheet } from "react-native";

export default function EmptyList() {
  return (
    <View style={styles.emptyContainer}>
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
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
    textAlign: "center",
    wordWrap: "break-word",
    width: "80%",
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
});
