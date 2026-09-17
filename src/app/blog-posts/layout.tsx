import React from "react";
import { Layout as BaseLayout } from "@components/refine-ui/layout/layout";

export default async function Layout({ children }: React.PropsWithChildren) {
  return <BaseLayout>{children}</BaseLayout>;
}
