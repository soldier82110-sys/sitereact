import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../common';
import { EditIcon } from './icons';

interface EditConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  currentName: string;
}

const EditConversationModal: React.FC<EditConversationModalProps> = ({ isOpen, onClose, onSave, currentName }) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ویرایش نام گفتگو">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          icon={<EditIcon className="w-5 h-5" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            لغو
          </Button>
          <Button type="submit">ذخیره</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditConversationModal;