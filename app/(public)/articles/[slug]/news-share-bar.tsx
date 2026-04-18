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
      <p className="mt-6 border-2 border-border bg-muted p-4 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Link bagikan tidak tersedia. Set{" "}
        <code className="bg-background px-1.5 py-0.5 text-primary">
          NEXT_PUBLIC_SITE_URL
        </code>{" "}
        atau akses lewat host yang valid.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4 border-t-2 border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
      <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-secondary">
        <Share2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
        <span>Bagikan Artikel</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <FacebookShareButton
          url={url}
          hashtag="#BPBDKotaBaubau"
          className="flex !cursor-pointer items-center justify-center border-2 border-border bg-card transition-colors hover:border-primary hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke Facebook"
        >
          <FacebookIcon size={ICON_SIZE} borderRadius={0} />
        </FacebookShareButton>

        <TwitterShareButton
          url={url}
          title={title}
          className="flex !cursor-pointer items-center justify-center border-2 border-border bg-card transition-colors hover:border-primary hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke X"
        >
          <TwitterIcon size={ICON_SIZE} borderRadius={0} />
        </TwitterShareButton>

        <LinkedinShareButton
          url={url}
          title={title}
          className="flex !cursor-pointer items-center justify-center border-2 border-border bg-card transition-colors hover:border-primary hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke LinkedIn"
        >
          <LinkedinIcon size={ICON_SIZE} borderRadius={0} />
        </LinkedinShareButton>

        <WhatsappShareButton
          url={url}
          title={title}
          separator=" "
          className="flex !cursor-pointer items-center justify-center border-2 border-border bg-card transition-colors hover:border-primary hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke WhatsApp"
        >
          <WhatsappIcon size={ICON_SIZE} borderRadius={0} />
        </WhatsappShareButton>

        <TelegramShareButton
          url={url}
          title={title}
          className="flex !cursor-pointer items-center justify-center border-2 border-border bg-card transition-colors hover:border-primary hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Bagikan ke Telegram"
        >
          <TelegramIcon size={ICON_SIZE} borderRadius={0} />
        </TelegramShareButton>
      </div>
    </div>
  );
}
