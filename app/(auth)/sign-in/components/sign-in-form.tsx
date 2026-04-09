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
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  rememberMe: z.boolean().optional(),
});

export function SignInForm() {
  const router = useRouter();
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
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        },
        {
          onSuccess: () => {
            toast.success("Berhasil masuk!");
            router.refresh();
            router.push("/dashboard/profiles");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Email atau password salah.");
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
    <div className="w-full max-w-md space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2 text-left"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Masuk
        </h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="h-1 rounded-full bg-primary"
        />
        <p className="text-muted-foreground">
          Masuk ke portal BPBD Kota Baubau
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-12 pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Sembunyikan" : "Tampilkan"} password
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-1.5 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel className="cursor-pointer font-normal text-muted-foreground">
                        Ingat saya
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Masuk
            </Button>
          </form>
        </Form>
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
