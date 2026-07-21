import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const folders = ["cms", "chat"];
    const allFiles: { name: string; url: string; folder: string; created: string }[] = [];

    for (const folder of folders) {
      const { data: files } = await admin.storage.from("cms-images").list(folder, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (files) {
        for (const file of files) {
          if (!file.name || file.name === ".emptyFolderPlaceholder") continue;
          const { data: urlData } = admin.storage.from("cms-images").getPublicUrl(`${folder}/${file.name}`);
          allFiles.push({
            name: file.name,
            url: urlData.publicUrl,
            folder,
            created: file.created_at || new Date().toISOString(),
          });
        }
      }
    }

    allFiles.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    return NextResponse.json(allFiles);
  } catch {
    return NextResponse.json({ error: "Failed to load media." }, { status: 500 });
  }
}
