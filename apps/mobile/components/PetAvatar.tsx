import { Image, StyleSheet, Text, View, type ViewProps } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PET_STYLE_EMOJI, type PetStyle } from '@/lib/types';

interface PetAvatarProps extends ViewProps {
  uri?: string | null;
  petStyle?: PetStyle;
  size?: number;
}

export default function PetAvatar({ uri, petStyle = 'cat', size = 80, style, ...rest }: PetAvatarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const innerSize = size - 6;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.tint,
          backgroundColor: colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
        />
      ) : (
        <View style={[styles.placeholder, { width: innerSize, height: innerSize, borderRadius: innerSize / 2, backgroundColor: colors.card }]}>
          <Text style={{ fontSize: innerSize * 0.45 }}>{PET_STYLE_EMOJI[petStyle]}</Text>
        </View>
      )}
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        <Text style={styles.badgeEmoji}>{PET_STYLE_EMOJI[petStyle]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeEmoji: {
    fontSize: 14,
  },
});
