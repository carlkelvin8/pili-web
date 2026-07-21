import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "cms";

    if (!file) {
      return NextResponse.json({ error: "No file selected. Please choose an image to upload." }, { status: 400 });
    }

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WebP, and SVG images are allowed." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "png";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const admin = createAdminClient();
    const { error } = await admin.storage.from("cms-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return NextResponse.json({ error: "We couldn't upload your image. Please try again." }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from("cms-images").getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "We couldn't upload your image. Please try again." }, { status: 500 });
  }
}
