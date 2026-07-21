import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file selected." }, { status: 400 });

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only images (PNG, JPG, WebP, GIF) and PDF files are allowed." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be smaller than 10 MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const path = `chat/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const admin = createAdminClient();
    const { error } = await admin.storage.from("cms-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });

    const { data: urlData } = admin.storage.from("cms-images").getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl, name: file.name, type: file.type });
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
