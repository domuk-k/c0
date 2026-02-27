import React from 'react';

import { Root } from './chat/Root.js';
import { MessageList } from './chat/MessageList.js';
import { Input } from './chat/Input.js';
import { Welcome } from './chat/Welcome.js';
import type { C0ChatProps } from './types.js';

/**
 * Main chat component — batteries-included.
 *
 * Built from the same compound components available via `@c0-ui/react/chat`.
 * For custom layouts, use the compound components directly.
 *
 * @example
 * ```tsx
 * // Tier 1: Batteries-included
 * <C0Chat apiUrl="/api/chat" theme="dark" />
 *
 * // Tier 2: Compound components
 * import * as Chat from '@c0-ui/react/chat';
 * <Chat.Root apiUrl="/api/chat">
 *   <Chat.MessageList />
 *   <Chat.Input />
 * </Chat.Root>
 * ```
 */
export function C0Chat({
  apiUrl,
  processMessage,
  components,
  theme = 'light',
  welcomeMessage,
  starters,
  onAction,
  renderArtifact,
  renderThink,
  className,
}: C0ChatProps) {
  return (
    <Root
      apiUrl={apiUrl}
      processMessage={processMessage}
      components={components}
      onAction={onAction}
      renderArtifact={renderArtifact}
      renderThink={renderThink}
      theme={theme}
      className={className}
    >
      {welcomeMessage && (
        <Welcome
          title={welcomeMessage.title}
          description={welcomeMessage.description}
          starters={starters}
        />
      )}
      <MessageList />
      <Input />
    </Root>
  );
}
