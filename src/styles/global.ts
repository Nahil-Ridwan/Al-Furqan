import { StyleSheet } from 'react-native';

/*
//brown
  background: '#1F150C',
  surface: '#3d2a13ad',
  primary: '#bfbaa8',
  
//blue-pink
  background: '#070F2B',
  surface: '#1F2544',
  primary: '#fba8da',

*/
export const colors = {
  
//brown
  background: '#2b1c0f',
  surface: '#3d2a13ad',
  primary: '#bfbaa8',
  popup: '#2d1e0d',
  inactive: '#3d2a139d',
  
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