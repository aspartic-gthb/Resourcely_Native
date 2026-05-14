import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, LinearTransition, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { getAllResources, getResourcesByCategory, searchResources, getResourceCategories, toggleResourceImportant, deleteResource } from '../database/DatabaseHelper';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Custom Animated Button Component for smooth scaling
const AnimatedTouchable = ({ onPress, onLongPress, children, style }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => scale.value = withSpring(0.95)}
      onPressOut={() => scale.value = withSpring(1)}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const { isDarkMode, colors, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const cats = await getResourceCategories();
      setCategories(['All', ...cats]);

      let res = [];
      if (searchQuery.trim().length > 0) {
        res = await searchResources(searchQuery);
      } else if (currentCategory === 'All') {
        res = await getAllResources();
      } else {
        res = await getResourcesByCategory(currentCategory);
      }
      setResources(res);
    } catch (e) {
      console.error(e);
    }
  }, [currentCategory, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = async (id) => {
    await deleteResource(id);
    loadData();
  };

  const handleToggleImportant = async (id, isImportant) => {
    await toggleResourceImportant(id, !isImportant);
    loadData();
  };

  const renderResourceItem = ({ item, index }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 50).springify()} 
      layout={LinearTransition.springify()}
    >
      <AnimatedTouchable 
        style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }]}
        onPress={() => navigation.navigate('AddEditResource', { id: item.id })}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.cardContent}>
          <LinearGradient 
            colors={[colors.primary + '20', colors.primaryDark + '20']} 
            style={styles.iconContainer}
          >
            <MaterialCommunityIcons name={item.type === 'LINK' ? 'link' : 'file-document'} size={24} color={colors.primary} />
          </LinearGradient>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.cardCategory, { color: colors.textSecondary }]}>{item.category}</Text>
          </View>
          <TouchableOpacity onPress={() => handleToggleImportant(item.id, item.is_important)} style={styles.starBtn}>
            <Ionicons name={item.is_important ? 'star' : 'star-outline'} size={24} color={item.is_important ? '#fbbf24' : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.background} style={StyleSheet.absoluteFillObject} />
      
      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={32} color={colors.headerIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={26} color={colors.headerIcon} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.FlatList
        data={resources}
        keyExtractor={item => item.id.toString()}
        renderItem={renderResourceItem}
        contentContainerStyle={styles.listContainer}
        itemLayoutAnimation={LinearTransition.springify()}
        ListEmptyComponent={() => (
          <Animated.View entering={FadeInUp} style={styles.emptyContainer}>
            <Ionicons name="layers-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No resources yet</Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Tap the plus button to add one.</Text>
          </Animated.View>
        )}
        ListHeaderComponent={
          <Animated.View entering={FadeInUp.duration(600).springify()}>
            <View style={styles.heroSection}>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]} numberOfLines={1}>
                {user?.displayName ? user.displayName.split(' ')[0] : 'Student'}
              </Text>
              
              <View style={[styles.searchContainer, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Find anything..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <View style={styles.chipContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24 }}>
                {categories.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.chip, 
                      { backgroundColor: colors.chipBg, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1 }, 
                      currentCategory === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setCurrentCategory(cat)}
                  >
                    <Text style={[
                      styles.chipText, 
                      { color: colors.textSecondary }, 
                      currentCategory === cat && styles.chipTextActive
                    ]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        }
      />

      <AnimatedTouchable 
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditResource')}
      >
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.fabGradient}>
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </AnimatedTouchable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -1.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 24,
    paddingHorizontal: 16,
    height: 56,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  chipContainer: {
    paddingLeft: 24,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardCategory: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  starBtn: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  emptySubText: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.7,
  },
});

export default HomeScreen;
