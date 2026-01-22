import { useState, KeyboardEvent, ClipboardEvent, useRef, ChangeEvent } from 'react';
import { Send, Plus, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatInputProps {
  onSend: (message: string, imageData?: { base64: string; mimeType: string }) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((message.trim() || selectedImage) && !disabled) {
      onSend(
        message.trim(),
        selectedImage ? { base64: selectedImage.base64, mimeType: selectedImage.mimeType } : undefined
      );
      setMessage('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Process image file (used by both file input and paste)
  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data:image/xxx;base64, prefix
      const base64Data = base64String.split(',')[1];
      setSelectedImage({
        base64: base64Data,
        mimeType: file.type,
        preview: base64String,
      });
      toast.success('Image attached');
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processImageFile(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Handle paste event - this is what enables Ctrl+V / Cmd+V for images
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Look for image items in the clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // Prevent default paste behavior
        const file = item.getAsFile();
        if (file) {
          processImageFile(file);
        }
        return; // Only process the first image
      }
    }
    // If no image found, let the default paste behavior handle text
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Image Preview */}
      {selectedImage && (
        <div className="mb-2 inline-block relative">
          <img
            src={selectedImage.preview}
            alt="Selected"
            className="max-h-32 rounded-xl border border-border"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="relative liquid-glass rounded-3xl">
        <div className="flex items-end gap-2 p-2 relative z-10">
          <button
            onClick={handleImageClick}
            disabled={disabled}
            className="p-2.5 hover:bg-accent/30 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
            title="Add image (or paste with Ctrl+V)"
          >
            {selectedImage ? (
              <ImageIcon className="w-5 h-5 text-primary" />
            ) : (
              <Plus className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={selectedImage ? "Describe what you want to know about this image" : "Ask Arcana"}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 bg-transparent resize-none border-0 outline-none text-sm py-2.5 px-1',
              'placeholder:text-muted-foreground/60 min-h-[40px] max-h-32',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && !selectedImage)}
              className="p-2.5 text-muted-foreground hover:text-foreground rounded-full disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-3 mb-4">
        $0.03 per query • Arcana can make mistakes
      </p>
    </div>
  );
}
