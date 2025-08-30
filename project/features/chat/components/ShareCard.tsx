import React, { forwardRef } from 'react';
import { Message } from '../../../types';
import { useAppSettings } from '../../../contexts';

interface ShareCardProps {
  userMessage: Message;
  aiMessage: Message;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ userMessage, aiMessage }, ref) => {
  const { settings } = useAppSettings();

  // Basic sanitization to prevent simple script injection from message text
  const sanitize = (text: string) => {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const renderedHtml = settings.shareCardTemplate
    .replace('{{QUESTION_TEXT}}', sanitize(userMessage.text))
    .replace('{{ANSWER_TEXT}}', sanitize(aiMessage.text));

  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
  );
});

export default ShareCard;
