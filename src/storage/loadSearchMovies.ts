import AsyncStorage from "@react-native-async-storage/async-storage";

export const loadSearchMovies = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("@movies_Saveds");
    const items = jsonValue != null ? JSON.parse(jsonValue) : [];
    return items;
  } catch (e) {
    console.error("Error loading moviesSaveds:", e);
    return [];
  }
};
