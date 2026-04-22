export const anxietyTypes = {
  communication: {
    code: 'communication',
    name: 'Communication Anxiety',
    icon: '🗣️',
    description:
      'Fear that you cannot express yourself clearly in real time, even when you know what you want to say.',
    resources: {
      primary: {
        title: 'Tips & Guides - Dealing with Speech Anxiety',
        url: 'https://www.hamilton.edu/academics/centers/oralcommunication/guides/dealing-with-speech-anxiety',
        description:
          'Explore common symptoms and management strategies such as Visualising Success and Shaking it Off.',
      },
    },
  },
  appearance: {
    code: 'appearance',
    name: 'Appearance Anxiety',
    icon: '🪞',
    description:
      'Worry that your physical appearance will be judged negatively and distract you from performing your best.',
    resources: {
      primary: {
        title: 'Reducing Appearance Preoccupation',
        url: 'https://www.cci.health.wa.gov.au/~/media/CCI/Consumer-Modules/Building-Body-Acceptance/Building-Body-Acceptance---03---Reducing-Appearance-Preoccupation.pdf',
        description:
          'Explore common thought processes associated with appearance preoccupation and strategies such as Attention Training and Postponing Appearance Preoccupation, rooted in Cognitive-Behavioural Therapy.',
      },
    },
  },
  social: {
    code: 'social',
    name: 'Social Anxiety',
    icon: '👥',
    description:
      'Difficulty maintaining natural conversational flow, interpreting social cues, and staying engaged in small talk.',
    resources: {
      primary: {
        title: 'Social Anxiety Self-Help Guide',
        url: 'https://www.nhsinform.scot/illnesses-and-conditions/mental-health/mental-health-self-help-guides/social-anxiety-self-help-guide/',
        description:
          'Explore common thoughts and behaviours associated with social anxiety and guided management strategies, such as the practice of Challenging Unhelpful Thoughts rooted in Cognitive-Behavioural Therapy.',
      },
    },
  },
  performance: {
    code: 'performance',
    name: 'Performance Anxiety',
    icon: '🎯',
    description:
      'Fear that your answers, knowledge, or abilities are not good enough to show your true competence.',
    resources: {
      primary: {
        title: 'This Way Up Coping Strategies for Performance Anxiety, Clinical Psychologist Katie Dobinson',
        url: 'https://thiswayup.org.au/resources/managing-performance-anxiety-the-strategies-that-work',
        description:
          'Explore causes, features and proven coping strategies, such as Controlled Breathing and Graded Exposure.',
      },
    },
  },
  behavioural: {
    code: 'behavioural',
    name: 'Behavioural Anxiety',
    icon: '🤝',
    description:
      'Worry that visible behaviours such as posture, fidgeting, eye contact, or speech habits create a poor impression.',
    resources: {
      primary: {
        title: 'Anxiety Shaking: What causes it?',
        url: 'https://www.healthline.com/health/anxiety-shaking#panic-disorder',
        description:
          'Explore core reasons for the manifestations of this anxiety type and strategies such as Progressive Muscle Relaxation and Mindfulness Exercises.',
      },
    },
  },
}

export const anxietyTypeList = Object.values(anxietyTypes)