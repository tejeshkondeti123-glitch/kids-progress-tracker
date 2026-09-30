// server/seedData.js

// Function to generate fresh seed data with timestamps anchored to today
function getInitialSeedData() {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const pastDate = new Date(Date.now() - 86400000).toISOString();

  const children = [
    {
      id: 'child_001',
      name: 'Sarah',
      age: 7,
      avatar: 'sarah-avatar',
      createdAt: pastDate,
    },
    {
      id: 'child_002',
      name: 'Leo',
      age: 4,
      avatar: 'leo-avatar',
      createdAt: pastDate,
    },
    {
      id: 'child_003',
      name: 'Maya',
      age: 5,
      avatar: 'maya-avatar',
      createdAt: pastDate,
    },
  ];

  const learningActivities = [
    {
      id: 'activity_001',
      childId: 'child_001',
      skill: 'Counting 1-10',
      subject: 'Math',
      description: 'Practiced counting objects from 1 to 10.',
      completedAt: `${today}T09:15:00Z`,
      status: 'needs_more_practice',
      practiceCount: 2,
    },
    {
      id: 'activity_002',
      childId: 'child_001',
      skill: 'Shapes',
      subject: 'Math',
      description: 'Practiced identifying circles, squares and triangles.',
      completedAt: `${today}T10:00:00Z`,
      status: 'practiced',
      practiceCount: 1,
    },
    {
      id: 'activity_003',
      childId: 'child_001',
      skill: 'Story Comprehension',
      subject: 'Reading',
      description: 'Practiced understanding simple story events.',
      completedAt: `${today}T11:30:00Z`,
      status: 'practiced',
      practiceCount: 1,
    },
  ];

  const realWorldActivities = [
    {
      id: 'real_001',
      skill: 'Counting 1-10',
      title: 'Count 5 Objects',
      description: 'Practice counting using familiar everyday objects found around the home.',
      instructions: [
        'Ask your child to collect 5 objects around the house (e.g. spoons, crayons, or socks).',
        'Ask them to line them up and count the objects out loud together.',
        'Ask: "How many objects are there altogether?"',
        'Add one more object to the line.',
        'Ask them to count again: "How many do we have now?"',
      ],
      duration: '5 minutes',
      reason: 'This activity helps your child use the counting concept in an everyday situation.',
    },
    {
      id: 'real_002',
      skill: 'Shapes',
      title: 'Living Room Shape Hunt',
      description: 'Spot circles, squares, and triangles in household furniture and items.',
      instructions: [
        'Pick one shape to start, like "circles".',
        'Walk around the room and have your child point out 3 circular items (clock, plate, coin).',
        'Ask: "What makes this a circle? Can you trace the round edge with your finger?"',
        'Switch to squares or triangles and repeat.',
      ],
      duration: '5 minutes',
      reason: 'Connects abstract geometric shapes to tangible physical items in your home.',
    },
    {
      id: 'real_003',
      skill: 'Story Comprehension',
      title: 'What Happened Next?',
      description: 'Retell a familiar part of their day or a bedtime story together.',
      instructions: [
        'Ask your child to pick their favorite short event from today (e.g., breakfast or a walk).',
        'Ask: "What happened first? What happened next?"',
        'Ask a "Why" question: "Why do you think that happened?"',
        'Encourage them to tell the end of the story in their own words.',
      ],
      duration: '5 minutes',
      reason: 'Strengthens narrative sequencing and comprehension through personal conversation.',
    },
    {
      id: 'real_004',
      skill: 'Letter Sounds',
      title: 'Alphabet Sound Safari',
      description: 'Find real objects around your home that start with specific letter sounds.',
      instructions: [
        'Say a letter sound together, like "/b/ as in Bear".',
        'Ask your child to find 2 things in the room starting with that sound (e.g., book, ball, bed).',
        'Praise their effort and say the words emphasizing the starting sound.',
        'Try another sound like "/s/ as in Sun" or "/m/ as in Moon".',
      ],
      duration: '5 minutes',
      reason: 'Connects auditory phonics knowledge with tangible everyday vocabulary.',
    },
    {
      id: 'real_005',
      skill: 'Logic & Patterns',
      title: 'Kitchen Pattern Parade',
      description: 'Build repeating patterns using spoons, forks, or colored cups.',
      instructions: [
        'Lay down a simple AB pattern: spoon, fork, spoon, fork.',
        'Ask: "What comes next in our parade?"',
        'Let your child add the next two items.',
        'Challenge: Try a slightly harder pattern like spoon, spoon, fork!',
      ],
      duration: '5 minutes',
      reason: 'Develops mathematical reasoning and foundational pattern recognition.',
    },
  ];

  const parentObservations = [
    {
      id: 'obs_001',
      childId: 'child_001',
      activityId: 'real_001',
      observation: 'needed_help',
      note: 'Needed help counting after adding another object.',
      createdAt: `${today}T08:30:00Z`,
    },
  ];

  return { children, learningActivities, realWorldActivities, parentObservations };
}

module.exports = { getInitialSeedData };
