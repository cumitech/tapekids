import { col, fn, Op } from "sequelize";

import { APP_SETTING_KEYS } from "@/constants/app-settings";
import {
  INVITATION_STATUSES,
  PAYMENT_STATUSES,
} from "@/constants/event-participation";
import { PERSON_CATEGORIES } from "@/constants/person";
import { Event, Invitation, Payment } from "@/data/entities";
import { AppSettingRepository } from "@/data/repositories/app-setting.repository";
import { TrophyRepository } from "@/data/repositories/trophy.repository";
import type { DashboardStats } from "@/models/dashboard/dashboard-stats.model";

const appSettingRepository = new AppSettingRepository();
const trophyRepository = new TrophyRepository();

export class DashboardService {
  async stats(): Promise<DashboardStats> {
    const [
      trophies,
      trophyCampers,
      trophyParticipants,
      invitationsSent,
      amountCollected,
      totalEvents,
      invitationLinksOpen,
    ] = await Promise.all([
      trophyRepository.countUniqueRegisteredPeople(),
      trophyRepository.countUniqueRegisteredPeople([
        PERSON_CATEGORIES.TROPHY_CAMPER,
      ]),
      trophyRepository.countUniqueRegisteredPeople([
        PERSON_CATEGORIES.TROPHY_PARTICIPANT,
      ]),
      Invitation.count({
        where: {
          status: {
            [Op.in]: [INVITATION_STATUSES.SENT, INVITATION_STATUSES.ACCEPTED],
          },
        },
      }),
      this.sumPaid(),
      Event.count(),
      appSettingRepository.getBoolean(
        APP_SETTING_KEYS.INVITATION_LINKS_OPEN,
        true
      ),
    ]);

    return {
      trophies,
      trophyCampers,
      trophyParticipants,
      invitationsSent,
      amountCollected,
      totalEvents,
      invitationLinksOpen,
    };
  }

  private async sumPaid() {
    const row = (await Payment.findOne({
      attributes: [[fn("SUM", col("amount")), "total"]],
      where: { status: PAYMENT_STATUSES.PAID },
      raw: true,
    })) as { total?: string | number | null } | null;
    const total = Number(row?.total ?? 0);
    return Number.isFinite(total) ? total : 0;
  }
}

export const dashboardService = new DashboardService();
