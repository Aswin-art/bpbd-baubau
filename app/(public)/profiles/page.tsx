import type { Metadata } from "next";
import Wrapper from "@/components/wrapper";
import { ProfilesClient } from "./profiles-client";

export const metadata: Metadata = {
  title: "Profil",
  description:
    "Tujuan & sasaran, struktur kepengurusan, dan kontak BPBD Kota Baubau.",
};

export default function ProfilesPage() {
  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <ProfilesClient />
    </Wrapper>
  );
}