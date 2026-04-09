"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { notFound } from "next/navigation";
import { toast } from "sonner";

import { PermissionGuard } from "../../components/permission-guard";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/helpers/date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AspirationStatus = "pending" | "in_progress" | "completed" | "rejected";

type AspirationDetail = {
  id: string;
  submitterName: string;
  description: string;
  status: AspirationStatus;
  adminReply?: string | null;
  repliedAt?: string | null;
  repliedById?: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchAspiration(id: string): Promise<AspirationDetail | null> {
  const res = await fetch(`/api/dashboard/aspirations/${id}`);
  if (res.status === 404) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || "Gagal memuat data aspirasi.");
  }
  return json.data as AspirationDetail;
}

function statusLabel(status: AspirationStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_progress":
      return "Diproses";
    case "completed":
      return "Selesai";
    case "rejected":
      return "Ditolak";
    default:
      return status;
  }
}

export default function AspirationDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState<AspirationStatus>("pending");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "aspirations", id],
    queryFn: () => fetchAspiration(id),
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    setReplyText((data?.adminReply || "").trim());
  }, [data?.adminReply]);

  useEffect(() => {
    if (data?.status) setStatus(data.status);
  }, [data?.status]);

  const replyMutation = useMutation({
    mutationFn: async (adminReply: string) => {
      const res = await fetch(`/api/dashboard/aspirations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal mengirim balasan.");
      }
      return json.data as AspirationDetail;
    },
    onSuccess: async () => {
      toast.success("Balasan berhasil dikirim.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aspirations", id] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aspirations"] }),
      ]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: async (nextStatus: AspirationStatus) => {
      const res = await fetch(`/api/dashboard/aspirations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") {
        throw new Error(json?.message || "Gagal mengubah status.");
      }
      return json.data as AspirationDetail;
    },
    onSuccess: async () => {
      toast.success("Status berhasil diperbarui.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aspirations", id] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "aspirations"] }),
      ]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-4 pt-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 p-4 pt-6 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Terjadi kesalahan</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Gagal memuat data aspirasi."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return notFound();

  return (
    <PermissionGuard resource="aspirations" action="read">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight font-heading">
            Detail aspirasi
          </h2>
          <p className="text-muted-foreground">
            Lihat aspirasi masyarakat dan berikan balasan.
          </p>
        </div>
        <Separator />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aspirasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{statusLabel(data.status)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Dikirim {data.createdAt ? formatDateTime(data.createdAt) : "-"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Nama</div>
                  <div className="font-medium">{data.submitterName}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Isi aspirasi</div>
                  <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm">
                    {data.description}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.adminReply ? (
                  <div className="space-y-2">
                    <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm">
                      {data.adminReply}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {data.repliedAt ? `Dibalas ${formatDateTime(data.repliedAt)}` : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Belum ada balasan.
                  </div>
                )}

                <PermissionGuard resource="aspirations" action="update">
                  <div className="space-y-2">
                    <PermissionGuard resource="aspirations" action="change_status">
                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Status</div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as AspirationStatus)}
                            disabled={statusMutation.isPending}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">Diproses</SelectItem>
                              <SelectItem value="completed">Selesai</SelectItem>
                              <SelectItem value="rejected">Ditolak</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="outline"
                            disabled={statusMutation.isPending || status === data.status}
                            onClick={() => statusMutation.mutate(status)}
                          >
                            {statusMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              "Simpan"
                            )}
                          </Button>
                        </div>
                      </div>
                    </PermissionGuard>

                    <Textarea
                      placeholder="Tulis balasan untuk masyarakat..."
                      className="min-h-[140px]"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={replyMutation.isPending}
                    />

                    <Button
                      type="button"
                      onClick={() => {
                        const value = replyText.trim();
                        if (!value) {
                          toast.error("Balasan tidak boleh kosong.");
                          return;
                        }
                        replyMutation.mutate(value);
                      }}
                      disabled={replyMutation.isPending}
                      className="w-full"
                    >
                      {replyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Kirim balasan
                        </>
                      )}
                    </Button>
                  </div>
                </PermissionGuard>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs truncate">{data.id}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <span>{statusLabel(data.status)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Terakhir update</span>
                  <span>{data.updatedAt ? formatDateTime(data.updatedAt) : "-"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

