const ADJECTIVES = ['软萌', '元气', '治愈', '神秘', '慵懒', '活泼', '温柔'];
const NOUNS = ['喵星人', '汪星人', '毛球', '小宠', '团子', '星星', '月亮', '云朵'];

export function generateAnonymousName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${adj.trim()}#${num}`;
}

export function generateLocalPetName(): string {
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${noun}#${num}`;
}
