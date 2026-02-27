'use client';

import { C0Chat } from '@c0/react';

export default function Home() {
  return (
    <C0Chat
      apiUrl="/api/chat"
      theme="dark"
      welcomeMessage={{
        title: 'c0 Playground',
        description:
          'Open-source Generative UI — direct LLM connection, no vendor lock-in.',
      }}
      starters={[
        {
          label: 'Create a sales dashboard',
          prompt:
            'Create a quarterly sales dashboard with a bar chart showing revenue by quarter and a table with top 5 products.',
        },
        {
          label: 'Build a user form',
          prompt:
            'Create a user registration form with name, email, role selection, and a newsletter checkbox.',
        },
        {
          label: 'Show me a comparison',
          prompt:
            'Compare React, Vue, and Svelte frameworks in a table with columns for performance, learning curve, ecosystem, and community size.',
        },
      ]}
    />
  );
}
