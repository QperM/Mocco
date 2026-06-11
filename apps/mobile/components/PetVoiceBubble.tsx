import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getPetVoiceLabel, playPetVoice } from '@/lib/pet-voice';
import { PET_STYLE_EMOJI, type PetStyle } from '@/lib/types';

interface PetVoiceBubbleProps {
  originalText: string;
  petTranslation: string;
  petStyle: PetStyle;
  isMine: boolean;
}

export default function PetVoiceBubble({
  originalText,
  petTranslation,
  petStyle,
  isMine,
}: PetVoiceBubbleProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);

  const bubbleBg = isMine ? colors.tint : colors.card;
  const textColor = isMine ? '#fff' : colors.text;
  const subColor = isMine ? 'rgba(255,255,255,0.75)' : colors.textSecondary;

  const handlePress = async () => {
    setPlaying(true);
    try {
      await playPetVoice(petStyle);
    } finally {
      setPlaying(false);
    }
  };

  return (
    <View style={[styles.wrap, isMine ? styles.mineWrap : styles.theirsWrap]}>
      <Pressable
        onPress={handlePress}
        onLongPress={() => setRevealed((v) => !v)}
        style={({ pressed }) => [
          styles.bubble,
          {
            backgroundColor: bubbleBg,
            borderColor: isMine ? colors.tint : colors.border,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: playing ? 1.03 : 1 }],
          },
        ]}
      >
        <View style={styles.bubbleHeader}>
          <Text style={styles.petEmoji}>{PET_STYLE_EMOJI[petStyle]}</Text>
          <Text style={[styles.voiceTag, { color: subColor }]}>
            {playing ? '🔊 喵呜播放中…' : `🔊 点击听${getPetVoiceLabel(petStyle)}`}
          </Text>
        </View>
        <Text style={[styles.petText, { color: textColor }]}>{petTranslation}</Text>
        <Text style={[styles.tapHint, { color: subColor }]}>点击播放 · 长按查看原文</Text>
      </Pressable>

      {revealed && (
        <View
          style={[
            styles.originalBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.originalLabel, { color: colors.textSecondary }]}>📝 原文</Text>
          <Text style={[styles.originalText, { color: colors.text }]}>{originalText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  mineWrap: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirsWrap: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  petEmoji: {
    fontSize: 16,
  },
  voiceTag: {
    fontSize: 11,
    fontWeight: '500',
  },
  petText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
    lineHeight: 26,
  },
  tapHint: {
    fontSize: 10,
    marginTop: 8,
  },
  originalBox: {
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: '100%',
  },
  originalLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  originalText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
