// client/src/services/curriculumCourse.js

export const COURSE_LEVELS = [
  {
    id: 'lvl_1',
    levelNum: 1,
    title: 'Counting Party',
    subject: 'Math',
    skill: 'Counting 1-10',
    mascot: 'Kodi',
    icon: '🍓',
    badge: 'Counting Star',
    gameType: 'counting',
    description: 'Count party treats and items from 1 to 10 with Kodi.',
    color: '#10b981',
    bgColor: '#ecfdf5',
    starsReward: 3,
  },
  {
    id: 'lvl_2',
    levelNum: 2,
    title: 'Shape Safari',
    subject: 'Math',
    skill: 'Shapes',
    mascot: 'Ollo',
    icon: '🔷',
    badge: 'Geometry Explorer',
    gameType: 'shapes',
    description: 'Explore circles, squares, and triangles in nature.',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    starsReward: 3,
  },
  {
    id: 'lvl_3',
    levelNum: 3,
    title: 'Letter Sounds Safari',
    subject: 'Reading',
    skill: 'Letter Sounds',
    mascot: 'Peck',
    icon: '🔤',
    badge: 'Phonics Pioneer',
    gameType: 'alphabet',
    description: 'Learn letter sounds and match phonics with animal friends.',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    starsReward: 3,
  },
  {
    id: 'lvl_4',
    levelNum: 4,
    title: 'Apple Harvest Addition',
    subject: 'Math',
    skill: 'Addition',
    mascot: 'Kodi',
    icon: '🍎',
    badge: 'Addition Ace',
    gameType: 'addition',
    description: 'Pick apples into baskets and add groups together (3 + 2 = 5).',
    color: '#ef4444',
    bgColor: '#fef2f2',
    starsReward: 5,
  },
  {
    id: 'lvl_5',
    levelNum: 5,
    title: 'Beach Splash Subtraction',
    subject: 'Math',
    skill: 'Subtraction',
    mascot: 'Sandy',
    icon: '⭐',
    badge: 'Subtraction Star',
    gameType: 'subtraction',
    description: 'Splash starfish into ocean waves and master take-away math (6 - 2 = 4).',
    color: '#f97316',
    bgColor: '#fff7ed',
    starsReward: 5,
  },
  {
    id: 'lvl_6',
    levelNum: 6,
    title: 'Storybook Comprehension',
    subject: 'Reading',
    skill: 'Story Comprehension',
    mascot: 'Reya',
    icon: '📖',
    badge: 'Storyteller Champ',
    gameType: 'story',
    description: 'Read magical storybooks and sequence what happened next.',
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    starsReward: 3,
  },
  {
    id: 'lvl_7',
    levelNum: 7,
    title: 'Leapfrog Multiplication',
    subject: 'Math',
    skill: 'Multiplication',
    mascot: 'Ollo',
    icon: '🐸',
    badge: 'Multiply Maestro',
    gameType: 'multiplication',
    description: 'Count frogs across lilypads to learn repeated groups (3 × 2 = 6).',
    color: '#6366f1',
    bgColor: '#eef2ff',
    starsReward: 5,
  },
  {
    id: 'lvl_8',
    levelNum: 8,
    title: 'Fair Share Division Picnic',
    subject: 'Math',
    skill: 'Division',
    mascot: 'Reya',
    icon: '🧁',
    badge: 'Fair Share Hero',
    gameType: 'division',
    description: 'Share cupcakes equally between friends and master division (8 ÷ 2 = 4).',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    starsReward: 5,
  },
];

const STORAGE_KEY_PREFIX = 'khan_kids_course_progress_';

export function getChildCourseProgress(childId = 'child_001') {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${childId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // Default initial progress for demo: Sarah starts having completed Level 1, 2, and 3, currently on Level 4
  const defaultCompleted =
    childId === 'child_001'
      ? ['lvl_1', 'lvl_2', 'lvl_3']
      : ['lvl_1'];

  return {
    completedLevelIds: defaultCompleted,
    currentLevelNum: defaultCompleted.length + 1,
    isGraduated: false,
    allUnlocked: false,
  };
}

export function saveChildCourseProgress(childId = 'child_001', progress) {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${childId}`,
      JSON.stringify(progress)
    );
  } catch {}
}
