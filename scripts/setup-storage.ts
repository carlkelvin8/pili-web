import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Failed to list buckets:", listError.message);
    process.exit(1);
  }

  const exists = buckets.some((b) => b.name === "cms-images");
  if (exists) {
    console.log('Bucket "cms-images" already exists.');
    return;
  }

  const { error } = await supabase.storage.createBucket("cms-images", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
  });

  if (error) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }

  console.log('Bucket "cms-images" created successfully.');
}

setup();
