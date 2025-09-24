"use client";

import { useTransition } from "react";

import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import { trpc } from "~/trpc/client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SubscriptionPlan, UserSubscriptionPlan } from "~/types";

interface BillingFormButtonProps {
  offer: SubscriptionPlan;
  subscriptionPlan: UserSubscriptionPlan;
  year: boolean;
  dict: Record<string, string>;
}

export function BillingFormButton({
  year,
  offer,
  dict,
  subscriptionPlan,
}: BillingFormButtonProps) {
  const [isPending, startTransition] = useTransition();

  async function createSession(planId: string) {
    try {
      console.log("尝试使用tRPC创建会话，planId:", planId);
      const res = await trpc.stripe.createSession.mutate({ planId: planId });
      console.log("tRPC响应:", res);
      if (res?.url) {
        console.log("重定向到:", res.url);
        window.location.href = res.url;
      } else {
        console.error("tRPC响应中没有URL");
        throw new Error("No URL in tRPC response");
      }
    } catch (error) {
      console.error("tRPC调用错误:", error);
      console.log("尝试使用API端点作为备选方案");
      
      try {
        const response = await fetch("/api/stripe/create-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId: planId }),
        });
        
        console.log("API响应状态:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("API响应数据:", data);
          if (data?.url) {
            console.log("重定向到:", data.url);
            window.location.href = data.url;
          } else {
            console.error("API响应中没有URL");
            alert("创建支付会话失败，请稍后再试");
          }
        } else {
          console.error("API请求失败:", response.statusText);
          alert("创建支付会话失败，请稍后再试");
        }
      } catch (fetchError) {
        console.error("API请求错误:", fetchError);
        alert("创建支付会话失败，请稍后再试");
      }
    }
  }

  const stripePlanId = year
    ? offer?.stripeIds?.yearly
    : offer?.stripeIds?.monthly;

  const stripeSessionAction = () =>
    startTransition(async () => await createSession(stripePlanId!));

  return (
    <Button
      variant="default"
      className="w-full"
      disabled={isPending}
      onClick={stripeSessionAction}
    >
      {isPending ? (
        <>
          <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> Loading...
        </>
      ) : (
        <>
          {subscriptionPlan.stripePriceId
            ? dict.manage_subscription
            : dict.upgrade}
        </>
      )}
    </Button>
  );
}
