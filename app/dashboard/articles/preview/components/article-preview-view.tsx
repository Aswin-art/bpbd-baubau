"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { XIcon, TelegramIcon, WhatsappIcon } from "react-share";

import { Separator } from "@/components/ui/separator";
import BackLink from "@/components/back-link";
import Wrapper from "@/components/wrapper";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
import { formatDate } from "@/helpers/date";

export interface ArticleViewData {
  title: string;
  content: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  authorName?: string | null;
  publishedAt?: Date | string | null;
}

interface ArticlePreviewViewProps {
  article: ArticleViewData;
}

export function ArticlePreviewView({ article }: ArticlePreviewViewProps) {
  const displayDate = article.publishedAt
    ? formatDate(article.publishedAt, "yyyy-MM-dd", "")
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="bg-background min-h-screen text-foreground pb-20">
      {/* Swiss Header Section */}
      <Wrapper className="pt-48 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-9">
            {/* Disabled Back Link for Preview */}
            <div className="mb-6 opacity-50 pointer-events-none">
              <BackLink href="#" label="Back to Articles" />
            </div>

            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] overflow-visible"
            >
              <span className="block">{article.title}</span>
            </motion.h1>
          </div>
          <div className="lg:col-span-3 flex flex-col justify-end pb-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="w-8 h-px bg-primary mb-4" />
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary block">
                  {article.category}
                </span>
                <span className="text-sm text-neutral-500">{displayDate}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </Wrapper>

      {/* Hero Image */}
      {article.thumbnailUrl && (
        <Wrapper>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-[50vh] md:h-[70vh] rounded-[2rem] overflow-hidden bg-neutral-100"
          >
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </Wrapper>
      )}

      {/* Content Section */}
      <Wrapper className="mt-12 md:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Sidebar / Meta */}
          <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
            {article.authorName && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-sm font-mono font-medium text-neutral-400 uppercase tracking-widest mb-6">
                  Author
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center">
                    <span className="text-lg font-bold text-neutral-500">
                      {article.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground leading-tight">
                      {article.authorName}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <Separator className="bg-neutral-200" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-sm font-mono font-medium text-neutral-400 uppercase tracking-widest mb-6">
                Share
              </h3>
              {/* Static Share Icons (No Functionality) */}
              <div className="flex gap-3 opacity-50 grayscale">
                <XIcon size={36} round />
                <TelegramIcon size={36} round />
                <WhatsappIcon size={36} round />
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 lg:col-start-5 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {article.excerpt && (
                <p className="text-xl md:text-2xl leading-relaxed font-light text-neutral-800 mb-12 border-l-4 border-primary pl-6">
                  {article.excerpt}
                </p>
              )}

              <Editor
                value={article.content}
                onChange={() => {}}
                disabled={true}
                className="prose prose-lg md:prose-xl max-w-none"
              />
            </motion.div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}
