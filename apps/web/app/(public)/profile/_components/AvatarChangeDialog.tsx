'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDropzone, FileRejection } from 'react-dropzone';
import { toast } from 'sonner';
import { useUploadAvatar } from '@/hooks/useUploadAvatar';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export function AvatarChangeDialog({
  open,
  onOpenChange,
  initialUrl,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialUrl?: string | null;
  onUploaded?: (url: string) => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Revoke the object URL to avoid memory leaks
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const upload = useUploadAvatar(async (url) => {
    toast.success('Cập nhật ảnh đại diện thành công');
    await onUploaded?.(url);
    clearSelection();
    onOpenChange(false);
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false,
    maxFiles: 1,
    maxSize: MAX_BYTES,
    onDrop(files) {
      const f = files?.[0];
      if (!f) return;
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError(null);
    },
    onDropRejected(rejs: FileRejection[]) {
      const r = rejs[0];
      if (!r) return;
      if (r.errors.some((e) => e.code === 'too-many-files'))
        return setError('Chỉ được chọn 1 ảnh.');
      if (r.errors.some((e) => e.code === 'file-too-large'))
        return setError('Ảnh quá lớn (tối đa 5MB).');
      if (r.errors.some((e) => e.code === 'file-invalid-type'))
        return setError('Định dạng không hợp lệ. Chỉ nhận ảnh.');
      setError('Không thể chọn ảnh này.');
    },
  });

  const current = useMemo(() => preview || initialUrl || null, [preview, initialUrl]);

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!file) {
      toast.message('Chưa chọn ảnh', { description: 'Hãy chọn một ảnh trước khi lưu.' });
      return;
    }
    upload.mutate(file);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !upload.isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi ảnh đại diện</DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="flex items-center gap-4 p-3 border rounded-xl bg-gray-50">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {current ? (
              <Image
                src={current}
                alt="preview"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-400">No image</span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            <div>Chọn ảnh (JPG/PNG/WebP), tối đa 5MB.</div>
            {file && <div className="mt-1 text-gray-500">Đã chọn: {file.name}</div>}
            {error && <div className="mt-1 text-red-600">{error}</div>}
          </div>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`mt-3 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps({ multiple: false })} ref={inputRef} />
          {isDragActive ? <p>Thả ảnh vào đây…</p> : <p>Kéo & thả ảnh hoặc bấm để chọn</p>}
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Left side buttons */}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={clearSelection}
              disabled={upload.isPending || !file}
            >
              Hủy chọn ảnh
            </Button>
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={upload.isPending}
            >
              Chọn ảnh
            </Button>
          </div>

          {/* Right side buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={upload.isPending}>
              {upload.isPending ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
