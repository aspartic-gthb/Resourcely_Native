import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { getResourceById, upsertResource } from '../database/DatabaseHelper';
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

const AddEditResourceScreen = ({ navigation, route }) => {
  const { colors } = useContext(ThemeContext);
  const resourceId = route.params?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('LINK');
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    if (resourceId) {
      const loadResource = async () => {
        const res = await getResourceById(resourceId);
        if (res) {
          setTitle(res.title);
          setDescription(res.tags || '');
          setUrl(res.link || '');
          setCategory(res.category || '');
          setType(res.type);
          setIsImportant(res.is_important === 1);
        }
      };
      loadResource();
    }
  }, [resourceId]);

  const handleSave = async () => {
    if (!title.trim() || !url.trim() || !category.trim()) {
      Alert.alert('Validation Error', 'Title, URL, and Category are required.');
      return;
    }

    await upsertResource({
      id: resourceId,
      title: title.trim(),
      tags: description.trim(),
      link: url.trim(),
      category: category.trim(),
      type,
      isImportant,
      createdAt: Date.now()
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.background} style={StyleSheet.absoluteFillObject} />
      
      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{resourceId ? 'Edit Resource' : 'New Resource'}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="e.g., React Native Docs" 
              placeholderTextColor={colors.textSecondary}
              value={title} 
              onChangeText={setTitle} 
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>URL Link</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="https://..." 
              placeholderTextColor={colors.textSecondary}
              value={url} 
              onChangeText={setUrl} 
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="e.g., Programming" 
              placeholderTextColor={colors.textSecondary}
              value={category} 
              onChangeText={setCategory} 
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Tags / Description</Text>
            <TextInput 
              style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
              placeholder="Add some notes or tags..." 
              placeholderTextColor={colors.textSecondary}
              value={description} 
              onChangeText={setDescription} 
              multiline
              numberOfLines={4}
            />

            <View style={styles.typeSelector}>
              <View style={{ flex: 1 }}>
                <AnimatedTouchable 
                  style={[styles.typeBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }, type === 'LINK' && { backgroundColor: colors.primary, borderColor: colors.primary }]} 
                  onPress={() => setType('LINK')}
                >
                  <Ionicons name="link" size={20} color={type === 'LINK' ? '#fff' : colors.textSecondary} />
                  <Text style={[styles.typeBtnText, { color: colors.textSecondary }, type === 'LINK' && { color: '#fff' }]}>Link</Text>
                </AnimatedTouchable>
              </View>
              <View style={{ flex: 1 }}>
                <AnimatedTouchable 
                  style={[styles.typeBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }, type === 'PDF' && { backgroundColor: colors.primary, borderColor: colors.primary }]} 
                  onPress={() => setType('PDF')}
                >
                  <Ionicons name="document-text" size={20} color={type === 'PDF' ? '#fff' : colors.textSecondary} />
                  <Text style={[styles.typeBtnText, { color: colors.textSecondary }, type === 'PDF' && { color: '#fff' }]}>PDF/Doc</Text>
                </AnimatedTouchable>
              </View>
            </View>

            <TouchableOpacity style={[styles.switchContainer, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setIsImportant(!isImportant)}>
              <View style={styles.switchLabelRow}>
                <Ionicons name={isImportant ? "star" : "star-outline"} size={24} color={isImportant ? "#fbbf24" : colors.textSecondary} />
                <Text style={[styles.switchLabel, { color: colors.text }]}>Mark as Important</Text>
              </View>
              <View style={[styles.radio, isImportant && { backgroundColor: colors.primary, borderColor: colors.primary }]} />
            </TouchableOpacity>

            <AnimatedTouchable style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{resourceId ? 'Save Changes' : 'Add Resource'}</Text>
            </AnimatedTouchable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  label: { fontSize: 14, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 24, fontSize: 16, fontWeight: '500' },
  textArea: { height: 100, textAlignVertical: 'top' },
  typeSelector: { flexDirection: 'row', marginBottom: 24 },
  typeBtn: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 16, marginHorizontal: 4 },
  typeBtnText: { fontWeight: '800', fontSize: 15, marginLeft: 8 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
  switchLabelRow: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { fontSize: 16, fontWeight: '700', marginLeft: 12 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1' },
  saveBtn: { padding: 18, borderRadius: 16, alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 0.5 },
});

export default AddEditResourceScreen;
