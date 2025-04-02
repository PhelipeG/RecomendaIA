import AsyncStorage from "@react-native-async-storage/async-storage";

interface SavedItem {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  [key: string]: any; // Para propriedades adicionais
}
export const removeSearchMovies = async (id: string): Promise<SavedItem[]> => {
  try {
    // Carrega os itens salvos do AsyncStorage
    const jsonValue = await AsyncStorage.getItem("@movies_Saveds");
    const items = jsonValue != null ? JSON.parse(jsonValue) : [];
    // Filtra os itens para remover o item com o ID especificado
    const updatedItems = items.filter((item: SavedItem) => item.id !== id);
    // Salva os itens atualizados de volta no AsyncStorage
    await AsyncStorage.setItem("@movies_Saveds", JSON.stringify(updatedItems));
    // Retorna os itens atualizados
    return updatedItems;
  } catch (e) {
    console.error("Error loading moviesSaveds:", e);
    return [];
  }
};
