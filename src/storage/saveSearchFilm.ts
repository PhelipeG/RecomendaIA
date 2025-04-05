import { Movie } from "../dtos/MovieDto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MOVIES_STORAGE_KEY = "@movies_Saveds";

// Interface para representar uma lista salva
interface SavedMovieList {
  id: string;
  date: string;
  title: string; // Nome opcional da pesquisa
  movies: Movie[];
}

// Função para salvar nova lista de filmes
export const saveSearchMovies = async (moviesSaveds: Movie[]) => {
  try {
    // Primeiro, recuperar as listas existentes
    const savedListsJSON = await AsyncStorage.getItem(MOVIES_STORAGE_KEY);
    let savedLists: SavedMovieList[] = [];

    if (savedListsJSON) {
      // Verifica se o formato atual é um array de SavedMovieList ou apenas um array de Movie
      const parsedData = JSON.parse(savedListsJSON);

      if (Array.isArray(parsedData) && parsedData.length > 0) {
        // Verifica se estamos lidando com o formato antigo (apenas array de Movie)
        if (
          parsedData[0].hasOwnProperty("title") &&
          !parsedData[0].hasOwnProperty("movies")
        ) {
          // Formato antigo - converter para o novo formato
          savedLists = [
            {
              id: `list-${Date.now()}-legacy`,
              date: new Date().toISOString(),
              title: "Lista anterior",
              movies: parsedData,
            },
          ];
        } else {
          // Já está no formato novo
          savedLists = parsedData;
        }
      }
    }

    // Criar nova entrada para a lista atual
    const newList: SavedMovieList = {
      id: `list-${Date.now()}`,
      date: new Date().toISOString(),
      title: `Recomendações ${new Date().toLocaleDateString()}`,
      movies: moviesSaveds,
    };

    // Adicionar à lista existente
    savedLists.push(newList);

    // Salvar todas as listas
    await AsyncStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(savedLists));

    return newList;
  } catch (e) {
    // salvamento com erro
    console.error("Erro ao salvar lista de filmes:", e);
    throw e;
  }
};

// Função para recuperar todas as listas salvas
export const getSavedMovieLists = async (): Promise<SavedMovieList[]> => {
  try {
    const savedListsJSON = await AsyncStorage.getItem(MOVIES_STORAGE_KEY);

    if (!savedListsJSON) return [];

    const parsedData = JSON.parse(savedListsJSON);

    // Verificar se estamos com o formato antigo (apenas um array de Movie)
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      if (
        parsedData[0].hasOwnProperty("title") &&
        !parsedData[0].hasOwnProperty("movies")
      ) {
        // Formato antigo - converter para o novo formato
        return [
          {
            id: `list-legacy`,
            date: new Date().toISOString(),
            title: "Lista anterior",
            movies: parsedData,
          },
        ];
      }
    }

    return parsedData || [];
  } catch (e) {
    console.error("Erro ao recuperar listas de filmes:", e);
    return [];
  }
};

// Função para excluir uma lista específica
export const deleteMovieList = async (listId: string): Promise<boolean> => {
  try {
    const lists = await getSavedMovieLists();
    const updatedLists = lists.filter((list) => list.id !== listId);

    await AsyncStorage.setItem(
      MOVIES_STORAGE_KEY,
      JSON.stringify(updatedLists)
    );
    return true;
  } catch (e) {
    console.error("Erro ao excluir lista de filmes:", e);
    return false;
  }
};
