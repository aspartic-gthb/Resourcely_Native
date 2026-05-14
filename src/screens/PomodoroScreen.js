import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useAnimatedStyle, withSpring, withRepeat, withSequence, useSharedValue } from 'react-native-reanimated';
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

const PomodoroScreen = ({ navigation, route }) => {
  const { colors, isDarkMode } = useContext(ThemeContext);

  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  
  const [isActive, setIsActive] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Animation values
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withSequence(withSpring(1.03), withSpring(1)),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isActive]);

  const animatedTimerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  useEffect(() => {
    const loadSettings = async () => {
      const savedWork = await AsyncStorage.getItem('pomodoro_work');
      const savedBreak = await AsyncStorage.getItem('pomodoro_break');
      
      let initialWork = savedWork ? parseInt(savedWork) : 25;
      if (route.params?.stipulatedTime) {
        initialWork = parseInt(route.params.stipulatedTime);
      }
      const w = initialWork;
      const b = savedBreak ? parseInt(savedBreak) : 5;
      
      setWorkTime(w);
      setBreakTime(b);
      setTimeLeft(w * 60);
    };
    loadSettings();
  }, [route.params?.stipulatedTime]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      const nextMode = !isWork;
      setIsWork(nextMode);
      setTimeLeft(nextMode ? workTime * 60 : breakTime * 60);
      setIsActive(false); 
    } else if (!isActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWork, workTime, breakTime]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWork ? workTime * 60 : breakTime * 60);
  };

  const switchMode = (toWork) => {
    setIsActive(false);
    setIsWork(toWork);
    setTimeLeft(toWork ? workTime * 60 : breakTime * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const applySettings = async () => {
    await AsyncStorage.setItem('pomodoro_work', String(workTime));
    await AsyncStorage.setItem('pomodoro_break', String(breakTime));
    setShowSettings(false);
    resetTimer();
  };

  const themeColors = isDarkMode 
    ? (isWork ? ['#0f172a', '#4c1d95'] : ['#0f172a', '#0369a1']) // Dark Mode (Work: Purple, Break: Ocean)
    : (isWork ? ['#f8fafc', '#ddd6fe'] : ['#f8fafc', '#bae6fd']); // Light Mode

  const activeColor = isWork ? (isDarkMode ? '#8b5cf6' : '#6d28d9') : (isDarkMode ? '#0ea5e9' : '#0284c7');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={themeColors} style={StyleSheet.absoluteFillObject} />

      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={32} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pomodoro</Text>
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)} style={styles.settingsBtn}>
          <Ionicons name="options-outline" size={28} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {showSettings && (
          <Animated.View entering={FadeInUp.springify()} style={[styles.settingsCard, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={[styles.settingsTitle, { color: colors.text }]}>Configure Timer</Text>
            <View style={styles.settingsRow}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Focus (mins)</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
                  value={String(workTime)} 
                  onChangeText={(val) => setWorkTime(parseInt(val) || 0)} 
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Break (mins)</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
                  value={String(breakTime)} 
                  onChangeText={(val) => setBreakTime(parseInt(val) || 0)} 
                  keyboardType="numeric" 
                />
              </View>
            </View>
            <AnimatedTouchable style={[styles.applyBtn, { backgroundColor: colors.text }]} onPress={applySettings}>
              <Text style={[styles.applyBtnText, { color: colors.card }]}>Save Settings</Text>
            </AnimatedTouchable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.toggleContainer}>
          <AnimatedTouchable 
            style={[styles.toggleBtn, isWork && { backgroundColor: activeColor }]} 
            onPress={() => switchMode(true)}
          >
            <Text style={[styles.toggleText, isWork ? { color: '#fff' } : { color: colors.textSecondary }]}>Focus</Text>
          </AnimatedTouchable>
          <AnimatedTouchable 
            style={[styles.toggleBtn, !isWork && { backgroundColor: activeColor }]} 
            onPress={() => switchMode(false)}
          >
            <Text style={[styles.toggleText, !isWork ? { color: '#fff' } : { color: colors.textSecondary }]}>Break</Text>
          </AnimatedTouchable>
        </Animated.View>

        <View style={styles.timerContainer}>
          <Animated.View style={[styles.timerCircle, { borderColor: activeColor, backgroundColor: colors.card, shadowColor: activeColor }, animatedTimerStyle]}>
            <Text style={[styles.timeText, { color: colors.text }]}>{formatTime(timeLeft)}</Text>
            <Text style={[styles.modeText, { color: activeColor }]}>{isWork ? 'Stay Focused' : 'Take a Break'}</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.controls}>
          <AnimatedTouchable style={[styles.controlBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]} onPress={resetTimer}>
            <Ionicons name="refresh" size={28} color={colors.textSecondary} />
          </AnimatedTouchable>
          <AnimatedTouchable style={[styles.mainBtn, { backgroundColor: activeColor, shadowColor: activeColor }]} onPress={toggleTimer}>
            <Ionicons name={isActive ? "pause" : "play"} size={44} color="#fff" style={{ marginLeft: isActive ? 0 : 4 }} />
          </AnimatedTouchable>
          <View style={styles.controlBtn} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { paddingHorizontal: 24, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  settingsBtn: { padding: 4 },
  settingsCard: { marginHorizontal: 24, marginTop: 24, padding: 24, borderRadius: 20, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  settingsTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, letterSpacing: -0.5 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  inputGroup: { width: '48%' },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 18, textAlign: 'center', fontWeight: '800' },
  applyBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { fontWeight: '900', fontSize: 16 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  toggleBtn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: 30, marginHorizontal: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  toggleText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  timerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 40 },
  timerCircle: { width: 300, height: 300, borderRadius: 150, borderWidth: 12, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 10 },
  timeText: { fontSize: 72, fontWeight: '900', letterSpacing: 2, fontVariant: ['tabular-nums'] },
  modeText: { fontSize: 18, marginTop: 4, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  controls: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingBottom: 60 },
  controlBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  mainBtn: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8 },
});

export default PomodoroScreen;
