"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      } else {
        setIsSent(true);
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2 text-left"
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          BPBD Kota Baubau · Akun
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset password
        </h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="h-1 rounded-full bg-primary"
        />
        <p className="text-muted-foreground">
          Masukkan email terdaftar. Kami akan kirim tautan untuk membuat password
          baru.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {isSent ? (
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Tautan reset sudah dikirim.
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Silakan periksa kotak masuk atau folder spam. Jika belum masuk,
                  coba kirim ulang.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nama@email.com"
                        {...field}
                        className="h-12 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="h-12 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                Kirim Tautan Reset
              </Button>
            </form>
          </Form>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-center"
      >
        <Link
          href="/sign-in"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke halaman masuk
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="pt-6 text-center text-xs text-muted-foreground"
      >
        <p>
          &copy; {new Date().getFullYear()} BPBD Kota Baubau &mdash; Badan
          Penanggulangan Bencana Daerah
        </p>
      </motion.div>
    </div>
  );
}
