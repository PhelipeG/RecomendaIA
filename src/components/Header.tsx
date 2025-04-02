import { View, Text, StyleSheet } from "react-native";

interface HeaderProps {
  title: string | string[];
}

export default function Header({ title }: HeaderProps) {
  return (
    <View style={styles.headerSaved}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  headerSaved: {
    width: "100%", // Reduzir a largura para permitir bordas arredondadas
    height: 140, // Altura do cabeçalho
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c1071e",
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
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    // Remover margens porque agora usamos padding do container
    marginBottom: 0,
    marginTop: -40,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
  },
});
