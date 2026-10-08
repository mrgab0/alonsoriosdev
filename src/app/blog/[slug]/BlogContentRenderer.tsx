"use client";

import React, { useMemo } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { LockedSnippet } from '@/components/LockedSnippet';

interface BlogContentRendererProps {
  content: string;
}

export default function BlogContentRenderer({ content }: BlogContentRendererProps) {
  // Pre-procesar ::locked_rest para convertirlo en un ::locked estándar que envuelve el resto del documento
  const processedContent = useMemo(() => {
    const readMoreRegex = /::locked_rest\{([^}]+)\}::([\s\S]*)/;
    return content.replace(readMoreRegex, (match, attrs, restOfArticle) => {
      return `::locked{${attrs}}\n${restOfArticle}\n::`;
    });
  }, [content]);

  // Regex para hacer match de ::locked{type="loquesea" title="loquesea"}contenido::
  const lockedRegex = /::locked\{([^}]+)\}([\s\S]*?)::/g;

  const blocks = useMemo(() => {
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = lockedRegex.exec(processedContent)) !== null) {
      // 1. Agregar contenido normal antes del match
      const normalText = processedContent.substring(lastIndex, match.index);
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
    const remainingText = processedContent.substring(lastIndex);
    if (remainingText) {
      result.push(
        <div key={`md-last`} className="prose dark:prose-invert max-w-none">
          <MarkdownPreview source={remainingText} style={{ backgroundColor: 'transparent' }} />
        </div>
      );
    }

    return result.length > 0 ? result : (
      <div className="prose dark:prose-invert max-w-none">
        <MarkdownPreview source={processedContent} style={{ backgroundColor: 'transparent' }} />
      </div>
    );
  }, [processedContent]);

  return (
    <div className="w-full" data-color-mode="dark">
      {blocks}
    </div>
  );
}
