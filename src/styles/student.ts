import { Platform, StyleSheet } from 'react-native';
import { colors } from "./global";

export const styles = StyleSheet.create({
totalText: {
  fontWeight: '700',
  color: colors.primary,
},

totalscoreInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.totalbox,
    borderColor: colors.totalboxborder,
  },



  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: colors.alert,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.contentborder,
  },
  profileContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  profileDetails: {
    flex: 1,
    marginRight: 16,
  },

  studentName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },

  detailItem: {
    marginBottom: 8,
  },

  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  infoVal: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },

  profileHorizontalLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  profileDetailsColumn: {
    flex: 1,
    marginRight: 20,
  },

  detailsStack: {
    marginTop: 8,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },

  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    marginTop: 11
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  profileImagePlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.background,
  },

  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 16,
  },
  infoCol: {
    alignItems: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary + '27',
  },
  tabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  innerSection: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.contentborder,
  },
  tabContent: {
    flex: 1,  // This is crucial - makes PagerView take remaining space
    paddingHorizontal: 16,
    marginVertical: 20,

  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  subjectMarkRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  subjectName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreInput: {
    color: colors.text,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: colors.inputbox,
    borderColor: colors.inputboxborder,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  saveBtnText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 15,
  },
  feeForm: {
    gap: 14,
  },
  feeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  feeLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  feeInput: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    width: 120,
    paddingVertical: 10,
  },
  feeTotalCard: {
    backgroundColor: '#6bcb7715',
    borderColor: '#6bcb7733',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  feeTotalLabel: {
    color: '#6bcb77',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  feeTotalVal: {
    color: '#6bcb77',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -4,
    marginLeft: 6
  },
  promotionForm: {
    gap: 14,
  },
  promoLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  promoInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  promoSubjectRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  promoAddBtn: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,

  },
  promoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  promoTagText: {
    color: colors.text,
    fontSize: 13,
  },
  promoteBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  promoteBtnText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 16,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
    marginBottom: 12,
  },
  historyCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  historyCardDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  historySubTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  historyTable: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  tableHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.11)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerText: {
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: 11,
  },
  colSubject: {
    flex: 2,
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  colMark: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    textAlign: 'center',
  },
  historyFeesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  historyFeesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  historyFeesVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6bcb77',
  },
});
