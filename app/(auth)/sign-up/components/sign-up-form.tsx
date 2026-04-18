"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await authClient.signUp.email(
        {
          email: values.email,
          password: values.password,
          name: values.name,
        },
        {
          onSuccess: () => {
            toast.success("Pendaftaran berhasil!");
            router.refresh();
            router.push("/dashboard/profiles");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Gagal mendaftar. Silakan coba lagi.");
            setIsLoading(false);
          },
        },
      );
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama Anda"
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs font-bold uppercase tracking-widest text-secondary">Konfirmasi Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-12 rounded-none border-2 border-border bg-background px-4 pr-12 font-medium transition-all focus:border-primary focus:ring-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full rounded-none px-4 hover:bg-transparent hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword ? "Sembunyikan" : "Tampilkan"} konfirmasi password
                        </span>
                      </Button>
                    </div>
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
              {isLoading && <Loader2 className="mr-3 h-5 w-5 animate-spin" strokeWidth={2.5} />}
              Daftar
            </Button>
          </form>
        </Form>

        <div className="mt-8 border-t-2 border-border pt-6 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:text-secondary transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
