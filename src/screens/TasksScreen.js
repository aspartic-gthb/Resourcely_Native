import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, LinearTransition, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { getAllTasks, addTask, updateTaskStatus, deleteTask } from '../database/DatabaseHelper';
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

const TasksScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleAdd = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a task title'); return; }
    const durMins = parseInt(duration) || 0;
    await addTask(title.trim(), desc.trim(), durMins, 'General');
    setTitle(''); setDesc(''); setDuration('');
    loadData();
  };

  const handleToggle = async (id, isDone) => {
    await updateTaskStatus(id, !isDone);
    loadData();
  };

  const handleDelete = (id, taskTitle) => {
    Alert.alert('Delete', `Remove task "${taskTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => { await deleteTask(id); loadData(); }, style: 'destructive' }
    ]);
  };

  const startTaskTimer = (item) => {
    navigation.navigate('Pomodoro', { stipulatedTime: item.due_date > 0 ? item.due_date : 25 });
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()} layout={LinearTransition.springify()}>
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }, item.is_done && { opacity: 0.6 }]}>
        <AnimatedTouchable style={styles.checkBtn} onPress={() => handleToggle(item.id, item.is_done)}>
          <Ionicons name={item.is_done ? "checkmark-circle" : "ellipse-outline"} size={32} color={item.is_done ? colors.success : colors.textSecondary} />
        </AnimatedTouchable>
        
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }, item.is_done && { color: colors.textSecondary, textDecorationLine: 'line-through' }]}>{item.title}</Text>
          {!!item.description && <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>}
          
          {item.due_date > 0 && !item.is_done && (
            <View style={[styles.stipulatedTag, { backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2' }]}>
              <Ionicons name="time" size={14} color="#f43f5e" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, color: '#f43f5e', fontWeight: '800' }}>{item.due_date} mins</Text>
            </View>
          )}
        </View>

        {!item.is_done && (
          <TouchableOpacity onPress={() => startTaskTimer(item)} style={styles.actionBtn}>
            <Ionicons name="play-circle" size={36} color={colors.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} style={styles.actionBtn}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tasks</Text>
        <View style={{ width: 32 }} />
      </Animated.View>

      <Animated.FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        itemLayoutAnimation={LinearTransition.springify()}
        ListEmptyComponent={
          <Animated.View entering={FadeInUp} style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>All caught up!</Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>You have no pending tasks.</Text>
          </Animated.View>
        }
        ListHeaderComponent={
          <Animated.View entering={FadeInUp.duration(600).springify()} style={[styles.addCard, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={[styles.addCardTitle, { color: colors.text }]}>Create Task</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="What needs to be done?" 
              placeholderTextColor={colors.textSecondary}
              value={title} 
              onChangeText={setTitle} 
            />
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="Add details (Optional)" 
              placeholderTextColor={colors.textSecondary}
              value={desc} 
              onChangeText={setDesc} 
            />
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="Est. Time in mins (Optional)" 
              placeholderTextColor={colors.textSecondary}
              value={duration} 
              onChangeText={setDuration} 
              keyboardType="numeric"
            />
            <AnimatedTouchable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Add Task</Text>
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
  addCard: { borderRadius: 20, padding: 24, marginBottom: 24, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
  addCardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, letterSpacing: -0.5 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, fontWeight: '500' },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  card: { borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
  checkBtn: { marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  cardDesc: { fontSize: 14, marginTop: 6, fontWeight: '500' },
  stipulatedTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionBtn: { padding: 6, marginLeft: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { fontSize: 20, fontWeight: '800', marginTop: 16, letterSpacing: -0.5 },
  emptySubText: { fontSize: 15, marginTop: 8, opacity: 0.7 },
});

export default TasksScreen;
