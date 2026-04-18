"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
    // Simulasi proses reset password karena fungsionalitas aslinya belum diimplementasikan
    setTimeout(() => {
      toast.info("Fitur reset password sedang dalam pengembangan.");
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="w-full space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {isSent ? (
          <div className="border-2 border-border bg-muted p-6">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border-2 border-primary bg-primary text-primary-foreground">
                <Mail className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-black uppercase text-secondary">
                  Tautan Reset Dikirim
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                  Silakan periksa kotak masuk atau folder spam. Jika belum masuk,
                  coba kirim ulang.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">Email Terdaftar</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nama@email.com"
                        {...field}
                        className="h-12 rounded-none border-2 border-border bg-background px-4 font-medium transition-all focus:border-primary focus:ring-0"
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-[10px] font-bold uppercase tracking-widest text-destructive" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-6 h-14 w-full rounded-none border-2 border-primary bg-primary font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-background hover:text-primary"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" strokeWidth={2.5} />
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
        className="mt-8 border-t-2 border-border pt-6 text-center"
      >
        <Link
          href="/sign-in"
          className="inline-flex items-center font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={2.5} />
          Kembali ke Halaman Masuk
        </Link>
      </motion.div>
    </div>
  );
}
