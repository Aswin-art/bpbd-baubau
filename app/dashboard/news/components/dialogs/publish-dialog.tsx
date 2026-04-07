"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  isPublished: boolean;
  onConfirm: () => void;
}

export function PublishDialog({
  open,
  onOpenChange,
  articleTitle,
  isPublished,
  onConfirm,
}: PublishDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPublished ? "Tarik Artikel" : "Publikasikan Artikel"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPublished ? (
              <>
                Apakah Anda yakin ingin menarik artikel{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{articleTitle}&rdquo;
                </span>{" "}
                dari portal publik? Artikel tidak akan terlihat oleh pengunjung.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin mempublikasikan artikel{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{articleTitle}&rdquo;
                </span>
                ? Artikel akan tampil di portal publik.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isPublished ? "Tarik dari Portal" : "Publikasikan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
