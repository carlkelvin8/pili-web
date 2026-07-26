import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export interface CmsContent {
  [key: string]: unknown;
}

const PREVIEW_COOKIE = "cms_preview_mode";
const PREVIEW_SECRET = process.env.CMS_PREVIEW_SECRET ?? "preview-secret";

export async function isPreviewMode(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(PREVIEW_COOKIE)?.value === PREVIEW_SECRET;
  } catch {
    return false;
  }
}

export async function getCmsContent(section: string): Promise<CmsContent | null> {
  try {
    const preview = await isPreviewMode();
    const record = await prisma.pageContent.findUnique({
      where: {
        section,
        ...(preview ? {} : { status: "PUBLISHED" }),
      },
    });
    return (record?.content as CmsContent) ?? null;
  } catch {
    return null;
  }
}

export async function getAllCmsContent(): Promise<Record<string, CmsContent>> {
  try {
    const preview = await isPreviewMode();
    const whereClause = preview ? {} : { status: "PUBLISHED" as const };
    const records = await prisma.pageContent.findMany({ where: whereClause });
    const map: Record<string, CmsContent> = {};
    for (const r of records) {
      map[r.section] = r.content as CmsContent;
    }
    return map;
  } catch {
    return {};
  }
}
