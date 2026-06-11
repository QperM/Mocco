export type PetStyle = 'cat' | 'dog' | 'rabbit' | 'hamster' | 'fox';

export interface Profile {
  id: string;
  anonymous_name: string;
  avatar_url: string | null;
  pet_style: PetStyle;
  bio: string | null;
  tags: string[];
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  likes_count: number;
  created_at: string;
  profiles?: Pick<Profile, 'anonymous_name' | 'avatar_url' | 'pet_style'>;
}

export interface Conversation {
  id: string;
  user_a: string;
  user_b: string;
  ice_broken: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const PET_STYLE_EMOJI: Record<PetStyle, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  hamster: '🐹',
  fox: '🦊',
};

export const PET_STYLE_LABEL: Record<PetStyle, string> = {
  cat: '猫咪',
  dog: '狗狗',
  rabbit: '兔子',
  hamster: '仓鼠',
  fox: '狐狸',
};
