import Link from "next/link";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#151A17] text-[#F7F6F1] flex flex-col items-center justify-center p-6 text-center">
      <GitriumLogo variant="full" size="lg" className="mb-8" />
      <div className="w-16 h-16 rounded-[11px] bg-[#18352B] text-[#159A72] flex items-center justify-center mb-4 border border-[#159A72]/30">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="font-mono text-xs uppercase tracking-widest text-[#159A72] font-semibold mb-1">
        404 ERROR // NOT FOUND
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">Node Not Located</h1>
      <p className="mt-2 text-xs text-[#9DA7A1] max-w-sm font-sans leading-relaxed">
        The requested evidence node, repository audit record, or developer profile does not exist in the vault index.
      </p>

      <div className="mt-7">
        <Link href="/">
          <Button variant="emerald" size="md" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vault Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
