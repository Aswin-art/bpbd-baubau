"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  rememberMe: z.boolean().optional(),
});

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        void authClient.signIn.email(
          {
            email: values.email.trim().toLowerCase(),
            password: values.password,
            rememberMe: values.rememberMe,
          },
          {
            onSuccess: () => {
              void (async () => {
                try {
                  const r = await fetch("/api/auth/account-status", {
                    credentials: "include",
                    cache: "no-store",
                  });
                  const json = await r.json().catch(() => null);
                  const d = json?.data as
                    | { isActive?: boolean; banned?: boolean }
                    | undefined;

                  if (json?.status !== "success" || !d) {
                    await authClient.signOut().catch(() => {});
                    toast.error(
                      json?.message ||
                        "Tidak dapat memverifikasi status akun. Silakan coba lagi.",
                    );
                    reject(new Error("account-status"));
                    return;
                  }

                  if (d.banned === true) {
                    await authClient.signOut().catch(() => {});
                    toast.error("Akun Anda diblokir. Hubungi administrator.");
                    reject(new Error("banned"));
                    return;
                  }

                  if (d.isActive !== true) {
                    await authClient.signOut().catch(() => {});
                    toast.error(
                      "Akun Anda nonaktif. Hubungi administrator untuk mengaktifkan kembali.",
                    );
                    reject(new Error("inactive"));
                    return;
                  }

                  toast.success("Berhasil masuk!");
                  window.location.assign("/dashboard/profiles");
                  resolve();
                } catch {
                  await authClient.signOut().catch(() => {});
                  toast.error("Terjadi kesalahan saat verifikasi akun.");
                  reject(new Error("verify"));
                }
              })();
            },
            onError: (ctx) => {
              toast.error(ctx.error.message || "Email atau password salah.");
              reject(new Error(ctx.error.message || "sign-in"));
            },
          },
        );
      });
    } catch {
      // Pesan spesifik sudah ditampilkan di callback / inner catch.
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">Email</FormLabel>
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-12 rounded-none border-2 border-border bg-background px-4 pr-12 font-medium transition-all focus:border-primary focus:ring-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full rounded-none px-4 hover:bg-transparent hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Sembunyikan" : "Tampilkan"} password
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="font-mono text-[10px] font-bold uppercase tracking-widest text-destructive" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-2">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded-none border-2 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-secondary transition-colors">
                        Ingat Saya
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Link
                href="/forgot-password"
                className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors"
              >
                Lupa Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="mt-6 h-14 w-full rounded-none border-2 border-primary bg-primary font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-background hover:text-primary"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-3 h-5 w-5 animate-spin" strokeWidth={2.5} />}
              Masuk
            </Button>
          </form>
        </Form>

        <div className="mt-8 border-t-2 border-border pt-6 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/sign-up"
              className="text-primary hover:text-secondary transition-colors"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
