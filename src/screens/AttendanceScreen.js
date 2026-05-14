import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, LinearTransition, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { getAllAttendance, upsertAttendance, deleteAttendance } from '../database/DatabaseHelper';
import { ThemeContext } from '../theme/ThemeContext';

const AnimatedTouchable = ({ onPress, children, style }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => scale.value = withSpring(0.95)}
      onPressOut={() => scale.value = withSpring(1)}
      onPress={onPress}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

const AttendanceScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const [attendance, setAttendance] = useState([]);
  const [subject, setSubject] = useState('');
  const [total, setTotal] = useState('');
  const [attended, setAttended] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await getAllAttendance();
      setAttendance(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleAdd = async () => {
    if (!subject.trim()) { Alert.alert('Error', 'Please enter a subject name'); return; }
    const t = parseInt(total) || 0;
    const a = parseInt(attended) || 0;
    if (a > t) { Alert.alert('Error', 'Attended classes cannot be more than total'); return; }
    await upsertAttendance({ subject: subject.trim(), totalClasses: t, attendedClasses: a });
    setSubject(''); setTotal(''); setAttended('');
    loadData();
  };

  const markAttended = async (item) => {
    await upsertAttendance({ subject: item.subject, totalClasses: item.total_classes + 1, attendedClasses: item.attended_classes + 1 });
    loadData();
  };

  const markMissed = async (item) => {
    await upsertAttendance({ subject: item.subject, totalClasses: item.total_classes + 1, attendedClasses: item.attended_classes });
    loadData();
  };

  const handleDelete = (id, sub) => {
    Alert.alert('Delete', `Remove ${sub}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => { await deleteAttendance(id); loadData(); }, style: 'destructive' }
    ]);
  };

  const renderItem = ({ item, index }) => {
    const percentage = item.total_classes === 0 ? 0 : Math.round((item.attended_classes / item.total_classes) * 100);
    const isDanger = item.total_classes > 0 && percentage < 75;
    const color = isDanger ? colors.danger : colors.success;
    
    let infoMsg = null;
    let isWarning = false;
    
    if (item.total_classes > 0) {
      if (percentage < 75) {
        const needed = (3 * item.total_classes) - (4 * item.attended_classes);
        if (needed > 0) { infoMsg = `Attend ${needed} more class${needed > 1 ? 'es' : ''} to reach 75%`; isWarning = true; }
      } else {
        const safeToMiss = Math.floor((4 * item.attended_classes - 3 * item.total_classes) / 3);
        if (safeToMiss > 0) infoMsg = `Safe to bunk ${safeToMiss} class${safeToMiss > 1 ? 'es' : ''}`;
      }
    }

    return (
      <Animated.View entering={FadeInUp.delay(index * 50).springify()} layout={LinearTransition.springify()}>
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardSubject, { color: colors.text }]}>{item.subject}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.subject)} style={styles.delBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>{item.attended_classes} / {item.total_classes} classes attended</Text>
          
          {infoMsg && (
            <View style={[styles.warningContainer, { backgroundColor: isWarning ? colors.danger + '15' : colors.success + '15', borderColor: isWarning ? colors.danger + '30' : colors.success + '30' }]}>
              <Ionicons name={isWarning ? "warning" : "shield-checkmark"} size={16} color={isWarning ? colors.danger : colors.success} />
              <Text style={[styles.warningText, { color: isWarning ? colors.danger : colors.success }]}>{infoMsg}</Text>
            </View>
          )}

          <View style={styles.quickActionRow}>
            <AnimatedTouchable style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => markAttended(item)}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Attended</Text>
            </AnimatedTouchable>
            <AnimatedTouchable style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => markMissed(item)}>
              <Ionicons name="close" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Missed</Text>
            </AnimatedTouchable>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.background} style={StyleSheet.absoluteFillObject} />

      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={32} color={colors.headerIcon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Attendance</Text>
        <View style={{ width: 32 }} />
      </Animated.View>

      <Animated.FlatList
        data={attendance}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        itemLayoutAnimation={LinearTransition.springify()}
        ListHeaderComponent={
          <Animated.View entering={FadeInUp.duration(600).springify()} style={[styles.addCard, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={[styles.addCardTitle, { color: colors.text }]}>Add Subject</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="Subject Name" 
              placeholderTextColor={colors.textSecondary}
              value={subject} 
              onChangeText={setSubject} 
            />
            <View style={styles.inputRow}>
              <TextInput 
                style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
                placeholder="Total" 
                placeholderTextColor={colors.textSecondary}
                value={total} 
                onChangeText={setTotal} 
                keyboardType="numeric" 
              />
              <TextInput 
                style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
                placeholder="Attended" 
                placeholderTextColor={colors.textSecondary}
                value={attended} 
                onChangeText={setAttended} 
                keyboardType="numeric" 
              />
            </View>
            <AnimatedTouchable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Save Subject</Text>
            </AnimatedTouchable>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  addCard: { borderRadius: 20, padding: 20, marginBottom: 24, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
  addCardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16, fontWeight: '500' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  card: { borderRadius: 24, padding: 24, marginBottom: 20, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardSubject: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  delBtn: { padding: 4 },
  percentage: { fontSize: 56, fontWeight: '900', letterSpacing: -2 },
  statsText: { fontSize: 14, marginBottom: 16, fontWeight: '700', opacity: 0.8 },
  warningContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 12, borderRadius: 12, borderWidth: 1 },
  warningText: { fontSize: 13, marginLeft: 8, flex: 1, fontWeight: '800' },
  quickActionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginHorizontal: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  actionBtnText: { color: '#fff', fontWeight: '800', marginLeft: 8, fontSize: 15 },
});

export default AttendanceScreen;
