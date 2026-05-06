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
  allowSkip?: boolean;
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

    // Q2 — Jumper ages
    {
      id: 'jumperAges',
      title: 'Who will be jumping?',
      subtitle: 'Select all ages that apply — we use this to fine-tune safety and spring recommendations.',
      type: 'multi',
      maxSelect: 4,
      options: [
        { id: 'under-6', label: 'Under 6', description: 'Toddlers and young children' },
        { id: '6-12', label: '6 to 12', description: 'School-age kids' },
        { id: '13-17', label: 'Teens (13–17)' },
        { id: '18plus', label: 'Adults (18+)' },
      ],
    },

    {
      id: 'groundTypePreference',
      title: 'Do you want an above-ground or in-ground trampoline?',
      subtitle:
        'This is treated as a hard requirement in the quiz. Above-ground models are easier to set up and move. In-ground models sit lower in the yard and have a cleaner look, but usually require more installation work.',
      type: 'single',
      allowSkip: false,
      options: [
        { id: 'above-ground', label: 'Above-ground', description: 'Easier setup and more flexibility' },
        { id: 'in-ground', label: 'In-ground', description: 'Cleaner look and lower profile in the yard' },
      ],
    },

    // Q3 — Shape preference
    {
      id: 'shapePreference',
      title: 'Do you have a shape preference?',
      subtitle:
        'Round trampolines are usually more common, more forgiving for casual family play, and often cost less. Rectangular-style models give a more even bounce and suit gymnastics-style use, but they usually cost more and need more yard space.',
      type: 'single',
      options: [
        {
          id: 'round',
          label: 'Round / circle',
          description: 'Usually better value and a common choice for general family use',
        },
        {
          id: 'rectangle',
          label: 'Rectangle',
          description: 'More even bounce across the mat, but usually pricier and larger',
        },
        {
          id: 'not-sure',
          label: 'No preference',
          description: 'Show me the best options regardless of shape',
        },
      ],
    },

    // Q4 — Budget
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

    // Q5 — Spring type
    {
      id: 'springType',
      title: 'What type of spring system do you prefer?',
      subtitle: 'Choose the system you want, or select "Not sure" to see both.',
      type: 'single',
      allowSkip: false,
      options: [
        {
          id: 'traditional',
          label: 'Traditional springs',
          description:
            'Metal coil springs around the outside of the frame. Generally more affordable and easier to replace. Springs are covered by padding, but the pad can shift over time.',
        },
        {
          id: 'springless',
          label: 'Springless',
          description:
            'No exposed metal springs. Uses fiberglass rods or elastic straps attached under or inside the frame — keeping the jumping area clear of pinch points.',
        },
        {
          id: 'not-sure',
          label: 'Not sure',
          description: 'Show me both and let the quiz weighting decide.',
        },
      ],
    },

    // Q6 — Safety features
    {
      id: 'safetyFeatures',
      title: 'How important are advanced safety features to you?',
      subtitle:
        'Advanced features include curved safety poles that angle away from jumpers, springs positioned outside the enclosure, and a frame zone that keeps the jumping area clear of hard edges.',
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

    // Q7 — ASTM standards
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

    // Q8 — Priorities (multi-select)
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
