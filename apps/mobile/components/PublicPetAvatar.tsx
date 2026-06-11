import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PET_STYLE_EMOJI, PET_STYLE_LABEL, type PetStyle } from '@/lib/types';

interface PublicPetAvatarProps extends ViewProps {
  petStyle?: PetStyle;
  size?: number;
}

/** 公共 2D 萌宠占位形象，用于引导用户创建自己的皮套 */
export default function PublicPetAvatar({ petStyle = 'cat', size = 160, style, ...rest }: PublicPetAvatarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.wrap, style]} {...rest}>
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.tint,
            backgroundColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: size - 16,
              height: size - 16,
              borderRadius: (size - 16) / 2,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text style={[styles.emoji, { fontSize: size * 0.38 }]}>{PET_STYLE_EMOJI[petStyle]}</Text>
          <View style={[styles.tag, { backgroundColor: colors.tint }]}>
            <Text style={styles.tagText}>公共形象</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.caption, { color: colors.textSecondary }]}>
        {PET_STYLE_LABEL[petStyle]} · 默认萌宠
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  outerRing: {
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: {
    lineHeight: undefined,
  },
  tag: {
    position: 'absolute',
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  caption: {
    marginTop: 10,
    fontSize: 13,
  },
});
