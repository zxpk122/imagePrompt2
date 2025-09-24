import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@saasfly/auth";
import { stripe } from "@saasfly/stripe";
import { db } from "@saasfly/db";
import { env } from "@saasfly/auth/env.mjs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const customer = await db
      .selectFrom("Customer")
      .select(["id", "plan", "stripeCustomerId"])
      .where("authUserId", "=", userId)
      .executeTakeFirst();

    const returnUrl = env.NEXTAUTH_URL + "/dashboard";

    if (customer && customer.plan !== "FREE") {
      // 用户已订阅，创建账单门户会话
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.stripeCustomerId!,
        return_url: returnUrl,
      });
      return NextResponse.json({ success: true, url: session.url });
    }

    // 用户未订阅，创建结账会话
    const user = session.user;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const email = user.email!;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      client_reference_id: userId,
      subscription_data: { metadata: { userId } },
      cancel_url: returnUrl,
      success_url: returnUrl,
      line_items: [{ price: planId, quantity: 1 }],
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ success: false }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}