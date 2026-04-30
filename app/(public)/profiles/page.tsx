import type { Metadata } from "next";
import Wrapper from "@/components/wrapper";
import { getPublicSiteSettings } from "@/lib/get-public-site-settings";
import { ProfilesClient } from "./profiles-client";

export const metadata: Metadata = {
  title: "Profil",
  description:
    "Tujuan & sasaran, struktur kepengurusan, dan kontak BPBD Kota Baubau.",
};

export default async function ProfilesPage() {
  const { settings } = await getPublicSiteSettings();

  return (
    <Wrapper className="pt-24 pb-10 md:pt-28 xl:pt-32">
      <ProfilesClient settings={settings} />
    </Wrapper>
  );
}