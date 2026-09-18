import {
  parseAddMailingListMember,
  parseCreateMailingList,
  parseUpdateMailingList,
  toCreateMailingListPayload,
  toUpdateMailingListPayload,
  type CreateMailingList,
} from "@/data/dtos/mailing-list.dto";
import { contentTranslationRepository } from "@/data/repositories/content-translation.repository";
import { MailingListMemberRepository } from "@/data/repositories/mailing-list-member.repository";
import { MailingListRepository } from "@/data/repositories/mailing-list.repository";
import { PersonRepository } from "@/data/repositories/person.repository";
import type { ListQuery } from "@/data/types/pagination";
import { CONTENT_ENTITY_TYPES } from "@/constants/content-i18n";
import { nanoid } from "@/lib/api/id";
import { resolveContentLocale } from "@/lib/api/request-locale";
import { translationsFromInput } from "@/lib/content-i18n/input";
import { auditService } from "@/services/audit/audit.service";
import { personService } from "@/services/people/person.service";

const mailingListRepository = new MailingListRepository();
const mailingListMemberRepository = new MailingListMemberRepository();
const personRepository = new PersonRepository();

function mailingListTranslations(input: {
  translations?: CreateMailingList["translations"];
  name?: string;
  description?: string | null;
}) {
  return translationsFromInput(CONTENT_ENTITY_TYPES.mailingList, input, {
    name: input.name,
    description: input.description ?? "",
  });
}

export class MailingListService {
  async list(query: ListQuery) {
    const result = await mailingListRepository.list(query);
    return {
      ...result,
      data: await contentTranslationRepository.localize(
        CONTENT_ENTITY_TYPES.mailingList,
        result.data,
        resolveContentLocale()
      ),
    };
  }

  async getById(id: string) {
    const list = await mailingListRepository.findById(id);
    const [localized] = await contentTranslationRepository.localize(
      CONTENT_ENTITY_TYPES.mailingList,
      [list],
      resolveContentLocale(),
      true
    );
    return localized;
  }

  async create(body: unknown, createdById: string) {
    const input = parseCreateMailingList(body);
    const list = await mailingListRepository.create(
      toCreateMailingListPayload(input, createdById)
    );
    await contentTranslationRepository.replace(
      CONTENT_ENTITY_TYPES.mailingList,
      list.id,
      mailingListTranslations(input)
    );
    await this.syncMembers(list.id, input);
    const created = await this.getById(list.id);
    await auditService.record({
      action: "create",
      entity: "MailingList",
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async update(id: string, body: unknown) {
    const before = await mailingListRepository.findById(id);
    const input = parseUpdateMailingList(body);
    await mailingListRepository.update(id, toUpdateMailingListPayload(input));
    if (input.translations || input.name !== undefined || input.description !== undefined) {
      await contentTranslationRepository.replace(
        CONTENT_ENTITY_TYPES.mailingList,
        id,
        mailingListTranslations({
          ...input,
          name: input.name ?? before.name,
          description: input.description ?? before.description,
        })
      );
    }
    if (input.personIds !== undefined || input.memberFilters !== undefined) {
      await this.syncMembers(id, input);
    }
    const list = await this.getById(id);
    await auditService.record({
      action: "update",
      entity: "MailingList",
      entityId: id,
      before,
      after: list,
    });
    return list;
  }

  async delete(id: string) {
    const before = await mailingListRepository.findById(id);
    await mailingListRepository.delete(id);
    await auditService.record({
      action: "delete",
      entity: "MailingList",
      entityId: id,
      before,
    });
  }

  async addMember(listId: string, body: unknown) {
    await mailingListRepository.findById(listId);
    const input = parseAddMailingListMember(body);

    const person = input.personId
      ? await personRepository.findById(input.personId)
      : await personService.findOrCreateByEmail({
          email: input.email!,
          firstName: input.firstName,
          lastName: input.lastName,
        });

    const member = await mailingListMemberRepository.add({
      id: nanoid(),
      mailingListId: listId,
      personId: person.id,
    });
    await auditService.record({
      action: "create",
      entity: "MailingListMember",
      entityId: member.id,
      after: member,
    });
    return member;
  }

  async removeMember(listId: string, personId: string) {
    await mailingListRepository.findById(listId);
    await mailingListMemberRepository.remove(listId, personId);
    await auditService.record({
      action: "delete",
      entity: "MailingListMember",
      entityId: personId,
      before: { mailingListId: listId, personId },
    });
  }

  listMembers(listId: string) {
    return mailingListMemberRepository.listByList(listId);
  }

  private async syncMembers(
    listId: string,
    input: Pick<CreateMailingList, "personIds" | "memberFilters">
  ) {
    const fromSelection = input.personIds ?? [];
    let fromFilters: string[] = [];
    const filters = input.memberFilters;
    if (filters) {
      const eq = {
        ...(filters.region ? { region: filters.region } : {}),
        ...(filters.division ? { division: filters.division } : {}),
        ...(filters.subDivision ? { subDivision: filters.subDivision } : {}),
        ...(filters.town ? { town: filters.town } : {}),
        ...(filters.churchName ? { churchName: filters.churchName } : {}),
      };
      if (filters.q || Object.keys(eq).length) {
        const matches = await personRepository.list({
          offset: 0,
          limit: 1,
          sort: "lastName",
          order: "ASC",
          q: filters.q,
          eq: Object.keys(eq).length ? eq : undefined,
          idsOnly: true,
        });
        fromFilters = matches.data.map((person) => person.id);
      }
    }
    const personIds = Array.from(new Set(fromSelection.concat(fromFilters)));
    const existing = await personRepository.findByIds(personIds);
    await mailingListMemberRepository.replaceForList(
      listId,
      existing.map((person) => person.id)
    );
  }
}

export const mailingListService = new MailingListService();
