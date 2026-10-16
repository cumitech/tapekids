"use client";

import { ReportExportButton } from "@/components/reports/report-export-button";
import { ErrorComponent } from "@/components/shared/refine-ui/layout/error-component";
import {
  ListView,
  ListViewHeader,
} from "@/components/shared/refine-ui/views/list-view";
import { REPORT_KINDS } from "@/constants/reports";
import { useReportListPage } from "@/hooks/reports/use-report-list.hook";
import { MembershipReportTable } from "@/views/reports/membership-report-table";
import { PeopleReportTable } from "@/views/reports/people-report-table";
import { WaitingListReportTable } from "@/views/reports/waiting-list-report-table";

export function ReportListPage() {
  const page = useReportListPage();

  if (!page.valid || !page.kind) {
    return <ErrorComponent />;
  }

  return (
    <ListView>
      <ListViewHeader
        resource="reports"
        canCreate={false}
        title={page.title}
      >
        <ReportExportButton kind={page.kind} />
      </ListViewHeader>
      {page.isSponsors ? (
        <MembershipReportTable resource="reports/sponsors" />
      ) : page.isParticipants ? (
        <MembershipReportTable resource="reports/participants" />
      ) : page.isTrophyCampers ? (
        <MembershipReportTable resource="reports/trophy-campers" />
      ) : page.isTrophyParticipants ? (
        <MembershipReportTable resource="reports/trophy-participants" />
      ) : page.isWaitingList ? (
        <WaitingListReportTable />
      ) : page.isChaperones ? (
        <PeopleReportTable kind={REPORT_KINDS.CHAPERONES} />
      ) : (
        <ErrorComponent />
      )}
    </ListView>
  );
}
