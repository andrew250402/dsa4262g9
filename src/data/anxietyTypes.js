export const anxietyTypes = {
  communication: {
    code: 'communication',
    name: 'Communication Anxiety',
    icon: '🗣️',
    description:
      'Fear that you cannot express yourself clearly in real time, even when you know what you want to say.',
    resources: {
      primary: {
        title: 'The STAR Technique — Structure Your Interview Answers',
        url: 'https://www.rightattitudes.com/2008/07/15/star-technique-answer-interview-questions/',
        description:
          'A practical method to structure answers with clear context, action, and outcomes. It helps you stay organised under pressure and answer confidently even when questions feel broad.',
      },
      secondary: [
        {
          title: 'Structuring Interview Answers (3C Pyramid)',
          url: 'https://differentlywired.co.uk/structuring-interview-answers',
          description:
            'A concise framework for building clear and coherent responses without overexplaining.',
        },
        {
          title: 'How to Approach Difficult Interview Questions',
          url: 'https://www.nextjobpro.com/blog/ace-interview/answering-questions-during-interview/',
          description:
            'Step-by-step guidance for handling tough prompts while keeping your message structured.',
        },
      ],
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
        title: 'Body Language in an Interview: Master Confidence in Minutes',
        url: 'https://underdog.io/blog/body-language-in-an-interview',
        description:
          'Learn practical body-language adjustments that project calm confidence. The tips are easy to apply immediately before and during interviews.',
      },
      secondary: [
        {
          title: '7 Essential Interview Body Language Tips',
          url: 'https://www.confetto.ai/articles/interview-body-language-tips',
          description:
            'A focused checklist covering eye contact, posture, gestures, and facial expression cues.',
        },
        {
          title: 'Why Self-Confidence is More Important Than You Think (mindline.sg)',
          url: 'https://mindline.sg/grovve/self-help/library/article/why-self-confidence-is-more-important-than-you-think',
          description:
            'A grounded perspective on confidence-building habits that can reduce over-monitoring in interviews.',
        },
      ],
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
        title: 'How to Get Through a Job Interview with Social Anxiety',
        url: 'https://wellnessroadpsychology.com/job-interview-with-social-anxiety/',
        description:
          'Actionable coping strategies to handle anticipatory anxiety and social discomfort in interview settings. It provides practical ways to stay grounded and connected in conversation.',
      },
      secondary: [
        {
          title: 'How to Excel at Small Talk When You Have Social Anxiety',
          url: 'https://time.com/7305930/social-anxiety-conversation-tips/',
          description:
            'Simple conversation tactics to make rapport-building feel less stressful and more natural.',
        },
        {
          title: 'Social Anxiety — What is it, really? (mindline.sg community)',
          url: 'https://letstalk.mindline.sg/t/social-anxiety-what-is-it-really/5251',
          description:
            'A community-focused explainer that normalises experiences and offers practical perspective.',
        },
      ],
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
        title: 'Performance Anxiety: Symptoms, Causes, and Treatments',
        url: 'https://positivepsychology.com/performance-anxiety/',
        description:
          'A practical overview of why performance anxiety happens and what evidence-based strategies can help. It is useful for reducing perfectionism pressure before interviews.',
      },
      secondary: [
        {
          title: 'Overcoming Performance Anxiety',
          url: 'https://mindpeace.ca/performance-anxiety/',
          description:
            'A concise guide with reframing and regulation strategies for high-pressure moments.',
        },
        {
          title: 'Wysa AI Chatbot — Guided Self-Care Exercises (mindline.sg)',
          url: 'https://www.mindline.sg',
          description:
            'Access guided self-care exercises for stress and anxiety management between interviews.',
          mindlinePowered: true,
        },
      ],
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
        title: 'How to Calm Interview Nerves: 7 Techniques That Work',
        url: 'https://www.hiredkit.ai/blog/calm-interview-nerves-anxiety-techniques-2025',
        description:
          'A practical set of calming techniques to regulate breathing, pacing, and nervous energy. Use this before and during interviews to show steadier presence.',
      },
      secondary: [
        {
          title: 'How to Show Confidence Even If You Are Nervous',
          url: 'https://www.casebasix.com/pages/show-confidence-even-nervous',
          description:
            'Behavior-focused tactics for projecting confidence even when you still feel anxious inside.',
        },
        {
          title: 'Wysa AI Chatbot — Guided Self-Care Exercises (mindline.sg)',
          url: 'https://www.mindline.sg',
          description:
            'A guided support option for managing anxiety and building calm routines between interviews.',
          mindlinePowered: true,
        },
      ],
    },
  },
}

export const anxietyTypeList = Object.values(anxietyTypes)