import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@piliadheseal.com";
  const adminName = process.env.ADMIN_NAME || "Admin";
  const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  console.error("ADMIN_PASSWORD environment variable is required");
  process.exit(1);
}

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check if auth user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingAuthUser = existingUsers?.users?.find(
    (u) => u.email === adminEmail
  );

  let authUserId: string;

  if (existingAuthUser) {
    authUserId = existingAuthUser.id;
    console.log(`Auth user ${adminEmail} already exists.`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName },
    });

    if (error) {
      console.error("Failed to create auth user:", error.message);
      process.exit(1);
    }

    authUserId = data.user.id;
    console.log(`Created auth user: ${adminEmail} (${authUserId})`);
  }

  // Upsert in Prisma database
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN", id: authUserId, name: adminName },
    });
    console.log(`Updated ${adminEmail} to ADMIN role in database.`);
  } else {
    await prisma.user.create({
      data: {
        id: authUserId,
        email: adminEmail,
        name: adminName,
        role: "ADMIN",
      },
    });
    console.log(`Created admin user in database: ${adminEmail}`);
  }

  console.log(`\nDone! Login credentials:`);
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
