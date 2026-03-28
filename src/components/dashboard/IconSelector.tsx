"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, MessageCircle, Smile } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface IconSelectorProps {
  iconType: "default" | "emoji" | "image";
  iconEmoji?: string;
  customIcon?: string;
  onIconTypeChange: (type: "default" | "emoji" | "image") => void;
  onEmojiChange: (emoji: string) => void;
  onCustomIconChange: (url: string) => void;
}

export function IconSelector({
  iconType,
  iconEmoji,
  customIcon,
  onIconTypeChange,
  onEmojiChange,
  onCustomIconChange,
}: IconSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const popularEmojis = [
    "💬", "🎧", "👋", "🤖", "💡", "⚡", "🚀", "💼",
    "📞", "✉️", "❓", "💭", "🔔", "⭐", "👍", "❤️"
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onCustomIconChange(data.secure_url);
      toast.success('Icon uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload icon');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-semibold">Chatbot Icon</Label>

        <RadioGroup
          value={iconType}
          onValueChange={(value) => onIconTypeChange(value as "default" | "emoji" | "image")}
          className="space-y-4"
        >
          {/* Default Icon */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="default" id="default" />
            <Label htmlFor="default" className="flex items-center space-x-3 cursor-pointer flex-1">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium">Default Chat Icon</div>
                <div className="text-sm text-gray-500">Use the standard chat bubble icon</div>
              </div>
            </Label>
          </div>

          {/* Emoji Icon */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="emoji" id="emoji" />
            <Label htmlFor="emoji" className="flex items-center space-x-3 cursor-pointer flex-1">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Smile className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium">Emoji Icon</div>
                <div className="text-sm text-gray-500">Choose from popular emojis</div>
              </div>
            </Label>
          </div>

          {/* Custom Image */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image" className="flex items-center space-x-3 cursor-pointer flex-1">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Upload className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Custom Image</div>
                <div className="text-sm text-gray-500">Upload your own icon (PNG, JPG, SVG)</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Emoji Selection */}
      {iconType === "emoji" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Choose Emoji</Label>
          <div className="grid grid-cols-8 gap-2">
            {popularEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onEmojiChange(emoji)}
                className={`w-10 h-10 text-xl rounded-lg border-2 hover:border-blue-300 transition-colors ${iconEmoji === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-emoji" className="text-sm">Or enter custom emoji:</Label>
            <Input
              id="custom-emoji"
              value={iconEmoji || ''}
              onChange={(e) => onEmojiChange(e.target.value)}
              placeholder="Type any emoji..."
              className="w-32"
              maxLength={2}
            />
          </div>
        </div>
      )}

      {/* Image Upload */}
      {iconType === "image" && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Upload Icon</Label>

          {customIcon ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-green-50">
                <Image
                  src={customIcon}
                  alt="Custom icon"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Icon uploaded successfully!</div>
                  <div className="text-sm text-green-600">Your custom icon is ready to use</div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                Upload Different Icon
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                  Upload an icon for your chat chatbot
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Recommended: 32x32px, PNG/JPG/SVG, max 2MB
                </p>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Preview */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Preview</Label>
        <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6366F1' }}>
            {iconType === "default" && <MessageCircle className="w-4 h-4 text-white" />}
            {iconType === "emoji" && <span className="text-sm">{iconEmoji || '💬'}</span>}
            {iconType === "image" && customIcon && (
              <Image src={customIcon} alt="Custom icon" width={24} height={24} className="rounded" />
            )}
            {iconType === "image" && !customIcon && <Upload className="w-4 h-4 text-white" />}
          </div>
          <span className="text-sm text-gray-600">This is how your icon will appear</span>
        </div>
      </div>
    </div>
  );
}
