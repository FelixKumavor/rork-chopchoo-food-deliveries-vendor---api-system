import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useCart } from '@/providers/cart-provider';
import { router } from 'expo-router';

export default function FloatingCartButton() {
  const { cart, itemCount } = useCart();

  if (!cart || itemCount === 0) {
    return null;
  }

  return (
    <Animated.View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/cart')}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <ShoppingCart size={20} color="white" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            </View>
            <Text style={styles.itemsText}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={styles.totalText}>${cart.total.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  totalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});