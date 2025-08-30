import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Message } from '../../../types';
import { Modal, Button } from '../../../components/common';
import ShareCard from './ShareCard';
import { SpinnerIcon } from '../../../components/icons';
import { useToast } from '../../../contexts';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: { userMessage: Message; aiMessage: Message } | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, content }) => {
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!content) return null;

  const handleShareText = async () => {
    const shareText = `سوال کاربر:\n${content.userMessage.text}\n\nپاسخ هوش مصنوعی محراب:\n${content.aiMessage.text}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'گفتگو با هوش مصنوعی محراب',
          text: shareText,
        });
      } catch (error) {
        console.error('خطا در اشتراک‌گذاری متنی:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      showToast('قابلیت اشتراک‌گذاری در این مرورگر پشتیبانی نمی‌شود. متن در کلیپ‌بورد کپی شد.');
    }
    onClose();
  };

  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setIsProcessing(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        backgroundColor: null, 
        scale: 2, // Increase resolution for better quality
      });
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('خطا در ساخت تصویر.', 'error');
          setIsProcessing(false);
          return;
        }

        const file = new File([blob], 'mehrab-chat.png', { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'گفتگو با هوش مصنوعی محراب',
            });
          } catch (error) {
             console.error('خطا در اشتراک‌گذاری تصویر:', error);
          }
        } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'mehrab-chat.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('تصویر دانلود شد. قابلیت اشتراک‌گذاری مستقیم تصویر در این مرورگر پشتیبانی نمی‌شود.');
        }
        setIsProcessing(false);
        onClose();
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image with html2canvas:', error);
      showToast('خطا در ساخت تصویر.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="اشتراک‌گذاری گفتگو">
      <div className="text-center">
        <p className="mb-6 text-gray-600 dark:text-gray-400">محتوای خود را به چه شکلی به اشتراک می‌گذارید؟</p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleShareText} variant="secondary" className="flex-1">متن</Button>
          <Button onClick={handleShareImage} className="flex-1" disabled={isProcessing}>
            {isProcessing ? <SpinnerIcon className="w-5 h-5 mx-auto" /> : 'تصویر (کارت محراب)'}
          </Button>
        </div>
      </div>
      {/* Off-screen canvas for rendering */}
      <div className="absolute -left-[9999px] top-0">
        <ShareCard ref={cardRef} userMessage={content.userMessage} aiMessage={content.aiMessage} />
      </div>
    </Modal>
  );
};

export default ShareModal;
