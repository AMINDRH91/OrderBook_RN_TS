import HomeScreen from 'screens/Home';

/* PLOP_INJECT_IMPORT */
import { StackNavigationOptions } from '@react-navigation/stack';
import { IPeople } from 'src/interfaces/IPeople';

export type CommonStackParamList = {
  CharacterDetail: { character: IPeople };
  Home: undefined;
  /* PLOP_INJECT_TYPE */
};

const options: StackNavigationOptions = { gestureEnabled: false };

export const commonScreens = {
  Home: { component: HomeScreen, options }
  /* PLOP_INJECT_SCREEN */
};
