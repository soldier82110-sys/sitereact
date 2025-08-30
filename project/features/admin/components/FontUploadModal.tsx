import React, { useState, useCallback } from 'react';
import { Modal, Input, Button } from '../../../components/common';
import { UploadedFontFamily, FontFile } from '../../../types';
import { useToast } from '../../../contexts';

interface FontUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fontFamily: UploadedFontFamily) => void;
  editingFamily: UploadedFontFamily | null;
}

interface TempFile {
  id: number;
  file: File;
  weight: number;
  style: 'normal' | 'italic';
  src?: string;
}

const FontUploadModal: React.FC<FontUploadModalProps> = ({ isOpen, onClose, onSave, editingFamily }) => {
  const { showToast } = useToast();
  const [familyName, setFamilyName] = useState(editingFamily?.name || '');
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setFamilyName(editingFamily?.name || '');
      setTempFiles(editingFamily?.files.map((f, i) => ({
        id: i,
        file: new File([], `uploaded_font_${f.weight}.woff2`),
        weight: f.weight,
        style: f.style,
        src: f.src,
      })) || []);
    }
  }, [isOpen, editingFamily]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
        .filter(file => file.type === 'font/woff2')
        .map((file): TempFile => ({
          id: Date.now() + Math.random(),
          file,
          weight: 400, // default
          style: 'normal', // default
        }));
      
      if (newFiles.length !== e.target.files.length) {
        showToast('برخی فایل‌ها نادیده گرفته شدند. لطفاً فقط فایل‌های با فرمت WOFF2 را آپلود کنید.', 'error');
      }

      setTempFiles(prev => [...prev, ...newFiles]);
    }
  };

  const updateTempFile = (id: number, field: 'weight' | 'style', value: string | number) => {
    setTempFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };
  
  const removeTempFile = (id: number) => {
    setTempFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim() || tempFiles.length === 0) {
        showToast('لطفا نام خانواده فونت و حداقل یک فایل فونت را مشخص کنید.', 'error');
        return;
    }
    
    const filePromises = tempFiles.map(tf => {
        return new Promise<FontFile | null>((resolve) => {
          if (tf.src) { // If it's an existing font, just return its data
              resolve({ weight: tf.weight, style: tf.style, src: tf.src });
              return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve({ weight: tf.weight, style: tf.style, src: reader.result as string });
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(tf.file);
        });
    });

    const fontFiles = (await Promise.all(filePromises)).filter((f): f is FontFile => f !== null);

    if (fontFiles.length !== tempFiles.length) {
        showToast('خطا در خواندن برخی از فایل‌های فونت.', 'error');
        return;
    }

    onSave({
        id: editingFamily?.id || Date.now(),
        name: familyName,
        files: fontFiles,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingFamily ? 'ویرایش خانواده فونت' : 'افزودن خانواده فونت جدید'} size="lg">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام خانواده فونت</label>
          <Input placeholder="مثلا: ایران سنس" value={familyName} onChange={e => setFamilyName(e.target.value)} required />
        </div>

        <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">فایل‌های فونت (فقط WOFF2)</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-navy-gray-light rounded-lg p-6 text-center">
                 <input type="file" id="font-upload" multiple accept=".woff2" onChange={handleFileChange} className="hidden" />
                 <Button type="button" variant="secondary" onClick={() => document.getElementById('font-upload')?.click()}>انتخاب فایل‌ها...</Button>
                 <p className="text-xs text-gray-500 mt-2">می‌توانید چندین فایل برای وزن‌های مختلف آپلود کنید.</p>
            </div>
        </div>

        {tempFiles.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            <h4 className="font-semibold">مدیریت وزن‌ها</h4>
            {tempFiles.map(tf => (
              <div key={tf.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-gray-50 dark:bg-navy-gray p-2 rounded-md">
                <span className="truncate text-sm font-mono">{tf.file.name}</span>
                <div className="flex gap-2">
                    <Input type="number" placeholder="وزن (400)" value={tf.weight} onChange={e => updateTempFile(tf.id, 'weight', parseInt(e.target.value) || 400)} className="!py-1.5"/>
                    <select value={tf.style} onChange={e => updateTempFile(tf.id, 'style', e.target.value)} className="bg-white dark:bg-navy-gray-dark border border-gray-300 dark:border-navy-gray-light rounded-lg !py-1.5 text-sm">
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                    </select>
                </div>
                <button type="button" onClick={() => removeTempFile(tf.id)} className="text-red-500 hover:text-red-700 justify-self-end text-sm">حذف</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-navy-gray-light">
          <Button type="button" variant="secondary" onClick={onClose}>لغو</Button>
          <Button type="submit">ذخیره خانواده فونت</Button>
        </div>
      </form>
    </Modal>
  );
};

export default FontUploadModal;
