"use client";

import { useEffect, useRef, useState } from "react";
import {
  useCreateBlockNote,
  FormattingToolbar,
  FormattingToolbarController,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  CreateLinkButton,
  BlockTypeSelect,
  FileCaptionButton,
  FileReplaceButton,
} from "@blocknote/react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";

import { cn } from "@/lib/utils";
import { compressImage, formatFileSize, isImageFile } from "@/helpers/compress";

type EditorProps = {
  value: string | any[];
  onChange: (value: any[]) => void;
  disabled?: boolean;
  className?: string;
  scope?: string;
  /**
   * When true, prevents the read-only editor from using negative margins that
   * can visually overflow bordered containers (cards, panels).
   */
  bounded?: boolean;
};

const EMPTY_DOCUMENT_HTML = "<p><br /></p>";

async function uploadFile(file: File, scope: string): Promise<string> {
  if (!isImageFile(file)) {
    const error = "File harus berupa gambar (JPEG, PNG, WebP, GIF)";
    toast.error("Gagal Mengupload Gambar", {
      description: error,
    });
    throw new Error(error);
  }

  const startTime = Date.now();

  try {
    let fileToUpload = file;
    const originalSize = file.size;

    if (file.size > 1024 * 1024) {
      const result = await compressImage(file, {
        maxWidthOrHeight: 1200,
        maxSizeMB: 0.3,
        initialQuality: 0.8,
      });

      fileToUpload = result.file;
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("scope", scope);

    const response = await fetch(`/api/upload?scope=${scope}`, {
      method: "POST",
      body: formData,
    });

    const uploadTime = Date.now() - startTime;

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Upload gagal");
    }

    const sizeInfo =
      fileToUpload.size < originalSize
        ? `Ukuran: ${formatFileSize(originalSize)} → ${formatFileSize(
            fileToUpload.size,
          )}, Waktu: ${(uploadTime / 1000).toFixed(1)}s`
        : `Ukuran: ${formatFileSize(fileToUpload.size)}, Waktu: ${(
            uploadTime / 1000
          ).toFixed(1)}s`;

    toast.success("Gambar berhasil diunggah", {
      description: sizeInfo,
    });

    return result.url;
  } catch (error) {
    toast.error("Gagal mengunggah gambar", {
      description: (error as Error).message,
    });
    throw error;
  }
}

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export function Editor({
  value,
  onChange,
  disabled = false,
  className,
  scope = "news",
  bounded = false,
}: EditorProps) {
  const isInitializedRef = useRef(false);
  const { resolvedTheme } = useTheme();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string>("");

  // Initialize editor
  const editor = useCreateBlockNote(
    {
      uploadFile: (file) => uploadFile(file, scope),
    },
    [],
  );

  // Initialize content on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize content only once
  useEffect(() => {
    if (!editor || isInitializedRef.current) {
      return;
    }

    const initializeContent = async () => {
      if (!value) {
        isInitializedRef.current = true;
        return;
      }

      if (Array.isArray(value)) {
        editor.replaceBlocks(editor.document, value as any);
      } else if (typeof value === "string") {
        try {
          const parsedJson = JSON.parse(value);
          if (Array.isArray(parsedJson)) {
            editor.replaceBlocks(editor.document, parsedJson as any);
            isInitializedRef.current = true;
            return;
          }
        } catch (e) {
          // Not JSON, continue to HTML parsing
        }

        // It's HTML, try to parse
        const html = value.trim().length > 0 ? value : EMPTY_DOCUMENT_HTML;
        try {
          const parsedBlocks = await editor.tryParseHTMLToBlocks(html);
          editor.replaceBlocks(editor.document, parsedBlocks);
        } catch (error) {
          console.warn(
            "[BlockNoteEditor] Failed to parse HTML content.",
            error,
          );
        }
      }
      isInitializedRef.current = true;
    };

    initializeContent();
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.onChange(() => {
      const blocks = editor.document;
      onChange(blocks);
    });

    return () => {
      unsubscribe();
    };
  }, [editor, onChange]);

  if (!editor) {
    return null;
  }

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) return;

    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      e.preventDefault();
      e.stopPropagation();
      const src = (target as HTMLImageElement).src;
      if (src) {
        setLightboxSrc(src);
        setLightboxOpen(true);
      }
    }
  };

  return (
    <>
      <div
        onClick={handleEditorClick}
        className={cn("relative max-w-full", bounded && "overflow-hidden", className)}
      >
        <BlockNoteView
          sideMenu={disabled ? false : true}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          editor={editor}
          editable={!disabled}
          className={cn(
            "p-0 mt-4 max-w-full",
            disabled && !bounded && "-ml-14",
            disabled && bounded && "ml-0",
          )}
          formattingToolbar={false}
        >
          <FormattingToolbarController
            formattingToolbar={() => (
              <FormattingToolbar>
                <BlockTypeSelect key={"blockTypeSelect"} />

                <FileCaptionButton key={"fileCaptionButton"} />
                <FileReplaceButton key={"fileReplaceButton"} />

                <BasicTextStyleButton
                  basicTextStyle={"bold"}
                  key={"boldStyleButton"}
                />
                <BasicTextStyleButton
                  basicTextStyle={"italic"}
                  key={"italicStyleButton"}
                />
                <BasicTextStyleButton
                  basicTextStyle={"underline"}
                  key={"underlineStyleButton"}
                />
                <BasicTextStyleButton
                  basicTextStyle={"strike"}
                  key={"strikeStyleButton"}
                />
                <BasicTextStyleButton
                  basicTextStyle={"code"}
                  key={"codeStyleButton"}
                />

                <TextAlignButton
                  textAlignment={"left"}
                  key={"textAlignLeftButton"}
                />
                <TextAlignButton
                  textAlignment={"center"}
                  key={"textAlignCenterButton"}
                />
                <TextAlignButton
                  textAlignment={"right"}
                  key={"textAlignRightButton"}
                />
                <TextAlignButton
                  textAlignment={"justify"}
                  key={"textAlignJustifyButton"}
                />

                <ColorStyleButton key={"colorStyleButton"} />

                <NestBlockButton key={"nestBlockButton"} />
                <UnnestBlockButton key={"unnestBlockButton"} />

                <CreateLinkButton key={"createLinkButton"} />
              </FormattingToolbar>
            )}
          />
        </BlockNoteView>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: lightboxSrc }]}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}

export default Editor;
