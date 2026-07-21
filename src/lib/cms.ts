import { prisma } from "@/lib/prisma";

export interface CmsContent {
  [key: string]: unknown;
}

export async function getCmsContent(section: string): Promise<CmsContent | null> {
  try {
    const record = await prisma.pageContent.findUnique({ where: { section } });
    return (record?.content as CmsContent) ?? null;
  } catch {
    return null;
  }
}

export async function getAllCmsContent(): Promise<Record<string, CmsContent>> {
  try {
    const records = await prisma.pageContent.findMany();
    const map: Record<string, CmsContent> = {};
    for (const r of records) {
      map[r.section] = r.content as CmsContent;
    }
    return map;
  } catch {
    return {};
  }
}
