"use client";

import React, { useMemo } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { LockedSnippet } from '@/components/LockedSnippet';

interface BlogContentRendererProps {
  content: string;
}

export default function BlogContentRenderer({ content }: BlogContentRendererProps) {
  // Regex para hacer match de ::locked{type="loquesea" title="loquesea"}contenido::
  const lockedRegex = /::locked\{([^}]+)\}([\s\S]*?)::/g;

  const blocks = useMemo(() => {
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = lockedRegex.exec(content)) !== null) {
      // 1. Agregar contenido normal antes del match
      const normalText = content.substring(lastIndex, match.index);
      if (normalText) {
        result.push(
          <div key={`md-${lastIndex}`} className="prose dark:prose-invert max-w-none mb-4">
            <MarkdownPreview source={normalText} style={{ backgroundColor: 'transparent' }} />
          </div>
        );
      }

      // 2. Extraer atributos del match
      const attributesString = match[1];
      const lockedContent = match[2];

      // Parsear attributes (e.g. type="email" title="Mi Guia")
      const typeMatch = attributesString.match(/type="([^"]+)"/);
      const titleMatch = attributesString.match(/title="([^"]+)"/);

      const type = (typeMatch ? typeMatch[1] : 'email') as 'email' | 'whatsapp' | 'social';
      const title = titleMatch ? titleMatch[1] : 'Contenido Bloqueado';

      // 3. Agregar el LockedSnippet
      result.push(
        <div key={`locked-${match.index}`} className="my-8">
          <LockedSnippet type={type} title={title}>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownPreview source={lockedContent} style={{ backgroundColor: 'transparent' }} />
            </div>
          </LockedSnippet>
        </div>
      );

      lastIndex = lockedRegex.lastIndex;
    }

    // 4. Agregar texto restante si hay
    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      result.push(
        <div key={`md-last`} className="prose dark:prose-invert max-w-none">
          <MarkdownPreview source={remainingText} style={{ backgroundColor: 'transparent' }} />
        </div>
      );
    }

    return result.length > 0 ? result : (
      <div className="prose dark:prose-invert max-w-none">
        <MarkdownPreview source={content} style={{ backgroundColor: 'transparent' }} />
      </div>
    );
  }, [content]);

  return (
    <div className="w-full">
      {blocks}
    </div>
  );
}
