import type { Preview } from '@storybook/react-vite';

import './preview.css';

const preview: Preview = {
  parameters: {
    // Use our design-system surface as the canvas instead of Storybook's white.
    backgrounds: {
      default: 'background',
      values: [
        { name: 'background', value: '#0a0a0e' },
        { name: 'surface', value: '#0f1115' },
        { name: 'surface-elevated', value: '#161a21' },
      ],
    },
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    a11y: {
      // axe will surface contrast / aria issues right next to the story
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <div className="text-foreground dark font-sans">
        <Story />
      </div>
    ),
  ],
};

export default preview;
