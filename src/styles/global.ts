import { StyleSheet } from 'react-native';

/*
//grey-green
  background: '#1f1e26',
  surface: '#2d323a',
  primary: '#6eab73',
  
  popup: '#282b31',
  inactive: '#272b30',

  contentborder: '#777676',
  totalbox: '#6eab7329',
  totalboxborder: '#4b734f',

//yellow-grey
  background: '#1f1e26',
  surface: '#2d323a',
  primary: '#FFDD93',

  popup: '#24272d',
  inactive: '#272b30',

  contentborder: '#777676',
  totalbox: '#ffdd9318',
  totalboxborder: '#7a6945',

//grey-red
  background: '#212121',
  surface: '#323232',
  primary: '#EC625F',  

  popup: '#2b2b2b',
  inactive: '#26292c',

  contentborder: '#777676',
  totalbox: '#ec615f1b',
  totalboxborder: '#7b302f',

//grey-white
  background: '#1f1e26',
  surface: '#2d323a',
  primary: '#FBFACD',

*/
export const colors = {
  
//yellow-grey
  background: '#1f1e26',
  surface: '#2d323a',
  primary: '#FFDD93',

  popup: '#24272d',
  inactive: '#272b30',

  contentborder: '#777676',
  totalbox: '#ffdd9318',
  totalboxborder: '#7a6945',
  
  text: '#ffffff',
  textSecondary: '#a0a0b0',
  alert: '#ff5252',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 30,
    marginBottom: 16,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});