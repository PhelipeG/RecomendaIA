import { Movie } from "../dtos/MovieDto";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveSearchMovies = async (moviesSaveds: Movie[]) => {
  try {
    const jsonValue = JSON.stringify(moviesSaveds);
    await AsyncStorage.setItem("@movies_Saveds", jsonValue);
    return moviesSaveds;
  } catch (e) {
    // saving error
    console.error("Error saving moviesSaveds:", e);
  }
};
