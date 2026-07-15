import { StyleSheet } from 'react-native';

export const colors = {
  
//yellow-grey
  background: '#1f1e26',
  surface: '#2d323a',
  primary: '#FFDD93',

  popup: '#24272d',
  inactive: '#272b30',

  contentborder: '#777676',
  inputbox: '#ffdd930e',
  inputboxborder: '#7a6945',
  totalbox: '#6eab731a',
  totalboxborder: '#426546',

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