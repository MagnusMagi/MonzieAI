import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

type SeeAllScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SeeAll' | 'SceneDetail'
>;

type SeeAllScreenRouteProp = RouteProp<RootStackParamList, 'SeeAll'>;

export default function SeeAllScreen() {
  const navigation = useNavigation<SeeAllScreenNavigationProp>();
  const route = useRoute<SeeAllScreenRouteProp>();
  const { title, images } = route.params;
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  const handleImageLoadStart = (id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: true }));
  };

  const handleImageLoadEnd = (id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {images.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.imageCard}
              onPress={() =>
                navigation.navigate('SceneDetail', {
                  image: item.image,
                  title: item.title,
                  likes: item.likes,
                })
              }
            >
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => handleImageLoadStart(item.id)}
                onLoadEnd={() => handleImageLoadEnd(item.id)}
              />
              {imageLoading[item.id] && (
                <View style={styles.imageLoader}>
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                </View>
              )}
              <View style={styles.imageOverlay}>
                <View style={styles.imageInfo}>
                  <Text style={styles.imageTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.category && <Text style={styles.imageCategory}>{item.category}</Text>}
                </View>
                <View style={styles.imageActions}>
                  <View style={styles.imageStat}>
                    <Ionicons name="heart" size={14} color={colors.text.inverse} />
                    <Text style={styles.imageStatText}>{item.likes}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  imageCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  imageInfo: {
    marginBottom: spacing.xs,
  },
  imageTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.inverse,
  },
  imageCategory: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: spacing.xs / 2,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  imageStatText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.inverse,
  },
});
