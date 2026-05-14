import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, LinearTransition, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { getTimetableByDay, addTimetable, deleteTimetable } from '../database/DatabaseHelper';
import { ThemeContext } from '../theme/ThemeContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

const TimetableScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const [classes, setClasses] = useState([]);
  const [currentDay, setCurrentDay] = useState('Monday');
  
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState('Lecture');

  const loadData = useCallback(async () => {
    try {
      const data = await getTimetableByDay(currentDay);
      setClasses(data);
    } catch (e) {
      console.error(e);
    }
  }, [currentDay]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleAdd = async () => {
    if (!subject.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    await addTimetable({ subject: subject.trim(), day: currentDay, startTime: startTime.trim(), endTime: endTime.trim(), type });
    setSubject(''); setStartTime(''); setEndTime(''); setType('Lecture');
    loadData();
  };

  const handleDelete = (id, sub) => {
    Alert.alert('Delete', `Remove ${sub}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => { await deleteTimetable(id); loadData(); }, style: 'destructive' }
    ]);
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()} layout={LinearTransition.springify()}>
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={[styles.timeCol, { borderRightColor: colors.border }]}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.start_time}</Text>
          <View style={[styles.timeLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.end_time}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardSubject, { color: colors.text }]}>{item.subject}</Text>
          <View style={[styles.typeTag, { backgroundColor: item.type === 'Lab' ? colors.success + '20' : colors.primary + '20' }]}>
            <Text style={[styles.typeText, { color: item.type === 'Lab' ? colors.success : colors.primary }]}>{item.type}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.subject)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.background} style={StyleSheet.absoluteFillObject} />

      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={32} color={colors.headerIcon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Timetable</Text>
        <View style={{ width: 32 }} />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.daySelector}>
        <Animated.FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DAYS}
          keyExtractor={item => item}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <AnimatedTouchable 
              style={[styles.dayBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }, currentDay === item && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setCurrentDay(item)}
            >
              <Text style={[styles.dayText, { color: colors.textSecondary }, currentDay === item && styles.dayTextActive]}>{item.substring(0, 3)}</Text>
            </AnimatedTouchable>
          )}
        />
      </Animated.View>

      <Animated.FlatList
        data={classes}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        itemLayoutAnimation={LinearTransition.springify()}
        ListEmptyComponent={
          <Animated.View entering={FadeInUp} style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No classes scheduled</Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Add a class for {currentDay}</Text>
          </Animated.View>
        }
        ListHeaderComponent={
          <Animated.View entering={FadeInUp.duration(600).springify()} style={[styles.addCard, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={[styles.addCardTitle, { color: colors.text }]}>Add Class for {currentDay}</Text>
            
            <View style={styles.typeSelector}>
              <View style={{ flex: 1 }}>
                <AnimatedTouchable 
                  style={[styles.typeBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }, type === 'Lecture' && { backgroundColor: colors.primary, borderColor: colors.primary }]} 
                  onPress={() => setType('Lecture')}
                >
                  <Text style={[styles.typeBtnText, { color: colors.textSecondary }, type === 'Lecture' && { color: '#fff' }]}>Lecture</Text>
                </AnimatedTouchable>
              </View>
              <View style={{ flex: 1 }}>
                <AnimatedTouchable 
                  style={[styles.typeBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }, type === 'Lab' && { backgroundColor: colors.primary, borderColor: colors.primary }]} 
                  onPress={() => setType('Lab')}
                >
                  <Text style={[styles.typeBtnText, { color: colors.textSecondary }, type === 'Lab' && { color: '#fff' }]}>Lab</Text>
                </AnimatedTouchable>
              </View>
            </View>

            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="Subject (e.g. Data Structures)" 
              placeholderTextColor={colors.textSecondary}
              value={subject} 
              onChangeText={setSubject} 
            />
            <View style={styles.inputRow}>
              <TextInput 
                style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
                placeholder="Start (09:00)" 
                placeholderTextColor={colors.textSecondary}
                value={startTime} 
                onChangeText={setStartTime} 
              />
              <TextInput 
                style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
                placeholder="End (10:00)" 
                placeholderTextColor={colors.textSecondary}
                value={endTime} 
                onChangeText={setEndTime} 
              />
            </View>
            <AnimatedTouchable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Save Schedule</Text>
            </AnimatedTouchable>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  daySelector: { paddingBottom: 16 },
  dayBtn: { paddingHorizontal: 20, paddingVertical: 12, marginHorizontal: 6, borderRadius: 24 },
  dayText: { fontSize: 15, fontWeight: '700' },
  dayTextActive: { color: '#fff' },
  listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  addCard: { borderRadius: 20, padding: 24, marginBottom: 24, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
  addCardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, letterSpacing: -0.5 },
  typeSelector: { flexDirection: 'row', marginBottom: 16 },
  typeBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, alignItems: 'center', borderRadius: 12, marginHorizontal: 4 },
  typeBtnText: { fontWeight: '700', fontSize: 15 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, fontWeight: '500' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  card: { borderRadius: 20, padding: 16, marginBottom: 16, flexDirection: 'row', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
  timeCol: { alignItems: 'center', justifyContent: 'space-between', paddingRight: 16, borderRightWidth: 1 },
  timeText: { fontSize: 14, fontWeight: '800' },
  timeLine: { flex: 1, width: 2, marginVertical: 8, borderRadius: 1 },
  cardContent: { flex: 1, paddingLeft: 16, justifyContent: 'center' },
  cardSubject: { fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  typeTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  typeText: { fontSize: 13, fontWeight: '800' },
  deleteBtn: { justifyContent: 'center', paddingLeft: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { fontSize: 20, fontWeight: '800', marginTop: 16, letterSpacing: -0.5 },
  emptySubText: { fontSize: 15, marginTop: 8, opacity: 0.7 },
});

export default TimetableScreen;
