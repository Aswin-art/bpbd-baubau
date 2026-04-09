"use client";

import { Share2 } from "lucide-react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
} from "react-share";

type NewsShareBarProps = {
  title: string;
  /** URL absolut artikel (wajib untuk share; dari server/env/header). */
  url: string;
};

const ICON_SIZE = 36;

export function NewsShareBar({ title, url }: NewsShareBarProps) {
  if (!url) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Link bagikan tidak tersedia. Set{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          NEXT_PUBLIC_SITE_URL
        </code>{" "}
        atau akses lewat host yang valid.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Share2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span>Bagikan</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FacebookShareButton
          url={url}
          hashtag="#BPBDKotaBaubau"
          className="flex !cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke Facebook"
        >
          <FacebookIcon size={ICON_SIZE} round />
        </FacebookShareButton>

        <TwitterShareButton
          url={url}
          title={title}
          className="flex !cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke X"
        >
          <TwitterIcon size={ICON_SIZE} round />
        </TwitterShareButton>

        <LinkedinShareButton
          url={url}
          title={title}
          className="flex !cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke LinkedIn"
        >
          <LinkedinIcon size={ICON_SIZE} round />
        </LinkedinShareButton>

        <WhatsappShareButton
          url={url}
          title={title}
          separator=" "
          className="flex !cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke WhatsApp"
        >
          <WhatsappIcon size={ICON_SIZE} round />
        </WhatsappShareButton>

        <TelegramShareButton
          url={url}
          title={title}
          className="flex !cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke Telegram"
        >
          <TelegramIcon size={ICON_SIZE} round />
        </TelegramShareButton>
      </div>
    </div>
  );
}
