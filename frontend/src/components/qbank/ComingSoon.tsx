"use client";

import { useRouter } from "next/navigation";
import { Construction } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Construction size={32} className="text-primary" />
      </div>
      <h2 className="text-heading-4 text-ink">{title}</h2>
      <p className="text-body-md text-steel text-center max-w-sm">
        敬请期待，后续用户功能开放后完善
      </p>
      <button onClick={() => router.push("/quiz")} className="btn-secondary">
        返回题库
      </button>
    </div>
  );
}
