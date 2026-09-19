import type { PropsWithChildren } from "react";

import { Card } from "@/components/shared/ui/card";

export function AuthFormFrame({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-3 py-4 sm:px-6 sm:py-8">
      <Card className="w-full max-w-[456px] gap-4 p-4 sm:gap-6 sm:p-8">
        {children}
      </Card>
    </div>
  );
}
