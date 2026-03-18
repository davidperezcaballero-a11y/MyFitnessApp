import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function buildOrigin(headerList: Headers) {
  const forwardedProto = headerList.get("x-forwarded-proto");
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (forwardedProto && host) {
    return `${forwardedProto}://${host}`;
  }

  if (host) {
    return `http://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/";

  const headerList = await headers();
  const origin = buildOrigin(headerList);

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent("Enlace de confirmacion no valido.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "signup" | "invite" | "recovery" | "email_change" | "email",
  });

  if (error) {
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
      },
      {
        onConflict: "user_id",
      },
    );

    if (profileError) {
      return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(profileError.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
