import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fcccmfnyvignzdpplknc.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_2YSArftN_VEnGO_Tg8zi5A_ZeJKk0Vp";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  );

