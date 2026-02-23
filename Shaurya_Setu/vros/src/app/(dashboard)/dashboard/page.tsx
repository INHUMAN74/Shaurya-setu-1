import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) {
    redirect("/login?callbackUrl=/dashboard");
  }
  const role = session.user.role;
  const roleSlug = role === "veteran" ? "veteran" : role === "employer" ? "employer" : role === "counsellor" ? "counsellor" : "admin";
  redirect(`/dashboard/${roleSlug}`);
}
