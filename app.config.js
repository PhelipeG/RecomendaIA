import 'dotenv/config';

export default {
    expo: {
        name: "RecomendaIA",
        slug: "Recomenda-IA",
        version: "1.0.0",
        orientation: "portrait",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "cover",
            backgroundColor: "#ffffff"
        },
        newArchEnabled: true,
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.shakah.Recomendaia",
            versionCode: 1
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 250,
                    resizeMode: "cover"
                }
            ]
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            router: {
                origin: false
            },
            eas: {
                projectId: "dbfb869c-2b65-4def-9d26-224bacb0c045"
            },
            GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyC45cGsSJ6NCpZOI6cZdXe5kL_fGe74tYY",
            TMDB_API_KEY: process.env.EXPO_PUBLIC_TMDB_API_KEY || "36cae9ed9297814856ee6da33b656fdf"
        },
        owner: "shakah"
    }
};