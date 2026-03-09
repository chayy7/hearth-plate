import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const accounts = [
      {
        email: "merchant@dineverse.com",
        password: "Merchant@123",
        role: "merchant" as const,
        display_name: "Trattoria Merchant",
        restaurant_id: "00000000-0000-0000-0000-000000000001",
      },
      {
        email: "courier@dineverse.com",
        password: "Courier@123",
        role: "courier" as const,
        display_name: "Marco Rider",
        restaurant_id: null,
      },
    ];

    const results = [];

    for (const account of accounts) {
      // Check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u) => u.email === account.email);

      let userId: string;

      if (existing) {
        userId = existing.id;
        results.push({ email: account.email, status: "already_exists", userId });
      } else {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: { display_name: account.display_name },
        });

        if (createError) {
          results.push({ email: account.email, status: "error", error: createError.message });
          continue;
        }

        userId = newUser.user.id;
        results.push({ email: account.email, status: "created", userId });
      }

      // Assign role
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: account.role },
        { onConflict: "user_id,role" }
      );

      // Link merchant to restaurant
      if (account.role === "merchant" && account.restaurant_id) {
        await supabaseAdmin.from("merchant_restaurants").upsert(
          { user_id: userId, restaurant_id: account.restaurant_id },
          { onConflict: "user_id,restaurant_id" }
        );
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
