"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useDropzone, FileRejection } from "react-dropzone";
import {
  X,
  UploadCloud,
  Loader2,
  Crop as CropIcon,
  Trash2,
  ImageIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedImg, type Area } from "@/lib/canvas";
import {
  compressImage,
  type CompressOptions,
  formatFileSize,
} from "@/helpers/compress";

interface BaseProps {
  disabled?: boolean;
  onUpload: (file: File) => Promise<string>;
  aspectRatio?: number;
  compressionOptions?: CompressOptions;
  error?: string;
  accept?: Record<string, string[]>;
}

interface SingleUploadProps extends BaseProps {
  multiple?: false;
  value?: string;
  onChange: (value: string) => void;
}

interface MultipleUploadProps extends BaseProps {
  multiple: true;
  value?: string[];
  onChange: (value: string[]) => void;
}

type FileUploadProps = SingleUploadProps | MultipleUploadProps;

export default function FileUpload(props: FileUploadProps) {
  const {
    onChange,
    value,
    disabled = false,
    onUpload,
    aspectRatio,
    multiple = false,
    compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920 },
    error,
    accept,
  } = props;

  const [dropError, setDropError] = useState<string | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (aspectRatio) {
      const initialCrop = centerCrop(
        makeAspectCrop({ unit: "%", width: 100 }, aspectRatio, width, height),
        width,
        height,
      );
      setCrop(initialCrop);
    } else {
      setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 });
    }
  }

  const [isUploading, setIsUploading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [fileSize, setFileSize] = useState<string | null>(null);

  // Fetch file size for existing value
  useEffect(() => {
    if (!multiple && typeof value === "string" && value) {
      fetch(value, { method: "HEAD" })
        .then((res) => {
          const size = res.headers.get("content-length");
          if (size) {
            setFileSize(formatFileSize(Number.parseInt(size, 10)));
          }
        })
        .catch(() => setFileSize(null));
    } else {
      setFileSize(null);
    }
  }, [value, multiple]);

  // Calculate size for selected file in crop dialog
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);
  useEffect(() => {
    if (imageSrc) {
      fetch(imageSrc)
        .then((r) => r.blob())
        .then((b) => setSelectedFileSize(formatFileSize(b.size)));
    } else {
      setSelectedFileSize(null);
    }
  }, [imageSrc]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setDropError(null);
      if (multiple) {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);
        setProgressText("Memproses file...");

        try {
          const processedFiles = await Promise.all(
            acceptedFiles.map(async (file) => {
              if (file.type.startsWith("image/")) {
                try {
                  const result = await compressImage(file, compressionOptions);
                  return result.file;
                } catch (error) {
                  console.error(
                    `Gagal compress ${file.name}, menggunakan file asli`,
                    error,
                  );
                  return file;
                }
              }
              return file;
            }),
          );

          setProgressText("Mengupload...");

          const uploadPromises = processedFiles.map((file) => onUpload(file));
          const newUrls = await Promise.all(uploadPromises);

          const currentValues = Array.isArray(value) ? value : [];
          (onChange as (v: string[]) => void)([...currentValues, ...newUrls]);

          toast.success(`${newUrls.length} file berhasil diupload`);
        } catch (error) {
          console.error(error);
          toast.error("Gagal mengupload beberapa file");
        } finally {
          setIsUploading(false);
          setProgressText("");
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          setImageSrc(url);
        } else {
          // Direct upload for non-image files
          setIsUploading(true);
          setProgressText("Mengupload...");
          try {
            const uploadedUrl = await onUpload(file);
            if (!multiple) {
              (onChange as (v: string) => void)(uploadedUrl);
            }
            toast.success("File berhasil diupload");
          } catch (error) {
            console.error(error);
            toast.error("Gagal mengupload file");
          } finally {
            setIsUploading(false);
            setProgressText("");
          }
        }
      }
    },
    [multiple, onUpload, onChange, value, compressionOptions],
  );

  const handleDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      const rejection = fileRejections[0];
      if (!rejection) return;

      const errorCode = rejection.errors[0]?.code;
      let errorMessage = "";

      switch (errorCode) {
        case "file-invalid-type":
          errorMessage = accept
            ? "Tipe file tidak valid. Silakan periksa jenis file yang diizinkan."
            : "File tidak valid. Hanya gambar (JPG, PNG, GIF, WebP) yang diperbolehkan.";
          break;
        case "file-too-large":
          errorMessage = "Ukuran file terlalu besar. Maksimal 10MB per file.";
          break;
        case "too-many-files":
          errorMessage =
            "Terlalu banyak file. Upload satu file pada satu waktu.";
          break;
        default:
          errorMessage = accept
            ? "Gagal memproses file."
            : "Gagal memproses file. Pastikan file adalah gambar yang valid.";
      }

      setDropError(errorMessage);
      toast.error("Upload Gagal", { description: errorMessage });
    },
    [accept],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: handleDropRejected,
    accept: accept || { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    maxFiles: multiple ? 0 : 1,
    multiple: multiple,
    disabled: disabled || isUploading,
    maxSize: 10 * 1024 * 1024, // 10MB max
  });

  const handleCropAndUpload = async () => {
    if (!imageSrc) return;

    setIsUploading(true);
    setProgressText("Memproses gambar...");

    try {
      // If we don't have a valid crop from the user, we just fetch original and process it
      let croppedBlob: Blob | null = null;
      if (
        completedCrop &&
        completedCrop.width > 0 &&
        completedCrop.height > 0
      ) {
        croppedBlob = await getCroppedImg(
          imageSrc,
          completedCrop as Area,
          "image/jpeg",
          cropImageRef.current,
        );
      } else {
        // full image fallback
        const r = await fetch(imageSrc);
        croppedBlob = await r.blob();
      }

      if (!croppedBlob) throw new Error("Gagal memproses gambar");

      const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      setProgressText("Mengoptimasi ukuran...");
      const compressedResult = await compressImage(
        croppedFile,
        compressionOptions,
      );

      setProgressText("Mengupload...");
      const uploadedUrl = await onUpload(compressedResult.file);

      if (!multiple) {
        (onChange as (v: string) => void)(uploadedUrl);
      }

      handleClose();
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengupload gambar");
    } finally {
      setIsUploading(false);
      setProgressText("");
    }
  };

  const handleClose = () => {
    if (imageSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter((url) => url !== urlToRemove);
      (onChange as (v: string[]) => void)(newValue);
    } else {
      (onChange as (v: string) => void)("");
    }
  };

  if (multiple && Array.isArray(value) && value.length > 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-md overflow-hidden border group bg-muted flex items-center justify-center"
            >
              {url.toLowerCase().endsWith(".pdf") || url.includes(".pdf?") ? (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    PDF
                  </span>
                </div>
              ) : (
                <Image src={url} alt="Uploaded" fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  type="button"
                  onClick={() => handleRemove(url)}
                  disabled={disabled}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div
          {...getRootProps()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            disabled
              ? "cursor-not-allowed border-muted bg-muted/50"
              : isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary hover:bg-muted/50"
          } ${multiple ? "p-8" : "p-4"}`}
        >
          <input {...getInputProps()} />
          <div
            className={`flex flex-col items-center justify-center gap-2 ${multiple ? "h-30" : "h-auto"}`}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isUploading ? progressText : "Tambah gambar lagi"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!multiple && typeof value === "string" && value) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/10">
        <div className="relative w-full h-75 overflow-hidden rounded-md border bg-background flex items-center justify-center">
          {value.toLowerCase().endsWith(".pdf") || value.includes(".pdf?") ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileText className="w-16 h-16 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                PDF Document
              </span>
            </div>
          ) : (
            <Image
              src={value}
              alt="Uploaded file"
              className="object-contain"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          {fileSize && <span>Size: {fileSize}</span>}
        </div>
        {!disabled && (
          <Button
            variant="destructive"
            size="sm"
            type="button"
            className="mt-4"
            onClick={() => handleRemove(value)}
            disabled={isUploading}
          >
            <X className="w-4 h-4 mr-2" /> Hapus File
          </Button>
        )}
      </div>
    );
  }

  // Display error message (either from form validation or drop rejection)
  const displayError = error || dropError;

  return (
    <>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
          flex flex-col items-center justify-center gap-2 h-55
          ${
            isDragActive
              ? "border-primary bg-primary/10"
              : displayError
                ? "border-destructive bg-destructive/5"
                : "border-muted-foreground/25 hover:bg-muted/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div
          className={`p-4 rounded-full shadow-sm ${displayError ? "bg-destructive/10" : "bg-muted"}`}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <ImageIcon
              className={`w-8 h-8 ${displayError ? "text-destructive" : "text-muted-foreground"}`}
            />
          )}
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          {isUploading ? (
            <p className="font-medium text-primary">{progressText}</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop atau klik untuk upload</p>
              <p className="text-xs text-muted-foreground">
                {accept
                  ? "Format sesuai dengan yang diizinkan (Maks. 10MB)"
                  : "Format: JPG, PNG, GIF, WebP (Maks. 10MB)"}
              </p>
            </>
          )}
        </div>
      </div>
      {displayError && (
        <p className="text-sm text-destructive mt-2 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
          {displayError}
        </p>
      )}

      {!multiple && (
        <Dialog
          open={!!imageSrc}
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
        >
          <DialogContent className="sm:max-w-150">
            <DialogHeader>
              <DialogTitle>Sesuaikan Gambar</DialogTitle>
            </DialogHeader>

            <div className="relative flex w-full min-h-0 items-center justify-center overflow-auto rounded-md border bg-background max-h-[min(60vh,28rem)] p-2">
              {imageSrc && (
                <div className="flex justify-center items-center w-full min-h-0">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatio}
                    className="max-w-full"
                  >
                    <img
                      ref={cropImageRef}
                      alt="Upload"
                      src={imageSrc}
                      onLoad={onImageLoad}
                      className="block h-auto w-auto max-w-full max-h-[min(56vh,26rem)]"
                      draggable={false}
                    />
                  </ReactCrop>
                </div>
              )}
            </div>

            {selectedFileSize && (
              <span className="text-sm font-normal text-muted-foreground ml-auto">
                Original: {selectedFileSize}
              </span>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Batal
              </Button>
              <Button onClick={handleCropAndUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    {progressText}
                  </>
                ) : (
                  "Simpan & Upload"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
