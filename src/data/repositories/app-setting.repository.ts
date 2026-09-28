import { AppSetting } from "@/data/entities";

export class AppSettingRepository {
  async get(key: string): Promise<string | null> {
    const row = await AppSetting.findByPk(key);
    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<string> {
    const existing = await AppSetting.findByPk(key);
    if (existing) {
      existing.value = value;
      await existing.save();
      return existing.value;
    }
    const created = await AppSetting.create({ key, value });
    return created.value;
  }

  async getBoolean(key: string, fallback = true): Promise<boolean> {
    const value = await this.get(key);
    if (value == null) {
      return fallback;
    }
    return value === "true" || value === "1";
  }

  async setBoolean(key: string, value: boolean): Promise<boolean> {
    await this.set(key, value ? "true" : "false");
    return value;
  }

  async list(): Promise<AppSetting[]> {
    return AppSetting.findAll({ order: [["key", "ASC"]] });
  }
}
