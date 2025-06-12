import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';
import {
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
} from '@expo-google-fonts/lato';

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          // Roboto fonts (primary for body text)
          Roboto_400Regular,
          Roboto_500Medium,
          Roboto_700Bold,
          
          // Open Sans fonts (for UI elements)
          OpenSans_400Regular,
          OpenSans_600SemiBold,
          OpenSans_700Bold,
          
          // Lato fonts (for headings)
          Lato_400Regular,
          Lato_700Bold,
          Lato_900Black,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Set to true anyway to prevent app from hanging
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return fontsLoaded;
};