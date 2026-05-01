export interface QuizOption {
  id: string;
  label: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  subtitleExtra?: string;
  questionImage?: string;
  type: 'single' | 'multi';
  maxSelect?: number;
  options: QuizOption[];
  cardLayout?: boolean;
}

export function buildQuestions(): Question[] {
  return [
    // Q1 — Backyard size (concrete first — easiest to answer)
    {
      id: 'backyardSize',
      title: 'What size is your backyard?',
      subtitle:
        'We use this to recommend trampolines that actually fit your space. Allow at least 3 feet of clearance on all sides between the trampoline and fences, walls, or trees.',
      type: 'single',
      options: [
        { id: 'small', label: 'Small', description: 'Room for 8–10ft' },
        { id: 'medium', label: 'Medium', description: 'Room for 12ft' },
        { id: 'large', label: 'Large', description: 'Room for 14ft+' },
        {
          id: 'long-narrow',
          label: 'Long and narrow',
          description: 'More length than width — suits oval or rectangular models',
        },
        { id: 'not-sure', label: "Not sure", description: 'Show me all options' },
      ],
    },

    // Q2 — Budget
    {
      id: 'budget',
      title: "What's your budget?",
      subtitle: 'Choose up to two ranges if you want to widen the budget.',
      type: 'multi',
      maxSelect: 2,
      options: [
        { id: 'under-500', label: 'Under $500' },
        { id: '500-1000', label: '$500 – $1,000' },
        { id: '1000-1500', label: '$1,000 – $1,500' },
        { id: '1500-2500', label: '$1,500 – $2,500' },
        { id: '2500-plus', label: '$2,500+' },
        { id: 'flexible', label: 'Flexible / not sure' },
      ],
    },

    // Q3 — Spring type (visual card layout)
    {
      id: 'springType',
      title: 'What type of spring system do you prefer?',
      subtitle: 'Choose the system you want, or let the quiz compare both.',
      type: 'single',
      cardLayout: true,
      options: [
        {
          id: 'traditional',
          label: 'Traditional springs',
          description:
            'Metal coil springs around the outside of the frame. Generally more affordable and easier to replace. Springs are covered by padding, but the pad can shift over time.',
          imageSrc: '/quiz-images/traditional-springs.png',
          imageAlt: 'Traditional spring trampoline',
        },
        {
          id: 'springless',
          label: 'Springless',
          description:
            'No exposed metal springs. Uses fiberglass rods or elastic straps attached under or inside the frame — keeping the jumping area clear of pinch points.',
          imageSrc: '/quiz-images/springless-trampoline.png',
          imageAlt: 'Springless trampoline',
        },
        {
          id: 'not-sure',
          label: 'Not sure',
          description: 'Show me both and let the quiz weighting decide.',
        },
      ],
    },

    // Q4 — Safety features
    {
      id: 'safetyFeatures',
      title: 'How important are advanced safety features to you?',
      subtitle:
        'Advanced features include curved safety poles that angle away from jumpers, springs positioned outside the enclosure, and a frame zone that keeps the jumping area clear of hard edges.',
      subtitleExtra:
        'These features are most associated with springless designs like Springfree.',
      questionImage: '/quiz-images/trampoline-safety-features.png',
      type: 'single',
      options: [
        {
          id: 'essential',
          label: 'Essential',
          description: 'I want the safest option available',
        },
        {
          id: 'nice-to-have',
          label: 'Nice to have',
          description: 'Helpful, but not a dealbreaker',
        },
        {
          id: 'not-important',
          label: 'Not important',
          description: "I'm more focused on value",
        },
      ],
    },

    // Q5 — ASTM standards
    {
      id: 'standards',
      title: 'Is ASTM certification important to you?',
      subtitle:
        'ASTM F381 and F2225 are widely used US safety and durability benchmarks for recreational trampolines, covering design, padding, warning labels, and test methods.',
      type: 'single',
      options: [
        { id: 'yes', label: 'Yes, this matters to me' },
        { id: 'no', label: "No, it's not a requirement" },
      ],
    },

    // Q6 — Priorities (multi-select)
    {
      id: 'priorities',
      title: 'What matters most to you?',
      subtitle: 'Choose up to two. These are used to rank your top matches.',
      type: 'multi',
      maxSelect: 2,
      options: [
        { id: 'bounce', label: 'Best bounce quality' },
        { id: 'durability', label: 'Durability / longevity' },
        { id: 'value', label: 'Value for money' },
        { id: 'assembly', label: 'Easy assembly' },
        { id: 'warranty', label: 'Warranty & support' },
      ],
    },
  ];
}
