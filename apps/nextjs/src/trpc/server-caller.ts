import { createTRPCContext, t } from "@saasfly/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@saasfly/auth";
import { edgeRouter } from "@saasfly/api/edge";

/**
 * 创建服务器端 tRPC 调用器
 * 基于 https://trpc.io/docs/v11/server/server-side-calls
 */
export const createCaller = async () => {
  // 获取用户会话作为上下文
  const session = await getServerSession(authOptions);
  
  // 创建上下文
  const ctx = await createTRPCContext({});
  
  // 使用 t.createCallerFactory 创建调用器
  const createCallerFactory = t.createCallerFactory;
  const caller = createCallerFactory(edgeRouter)({
    ...ctx,
    session,
    userId: session?.user?.id,
  });
  
  return caller;
};

// 导出服务器端调用器实例
export const serverTrpc = {
  // 客户相关
  customer: {
    queryCustomer: async (input: { userId: string }) => {
      const caller = await createCaller();
      return caller.customer.queryCustomer(input);
    },
    insertCustomer: async (input: { userId: string }) => {
      const caller = await createCaller();
      return caller.customer.insertCustomer(input);
    }
  },
  // k8s相关
  k8s: {
    getClusters: async () => {
      const caller = await createCaller();
      return caller.k8s.getClusters();
    }
  },
  // 认证相关
  auth: {
    mySubscription: async () => {
      const caller = await createCaller();
      return caller.auth.mySubscription();
    }
  },
  // stripe相关
  stripe: {
    userPlans: async () => {
      const caller = await createCaller();
      return caller.stripe.userPlans();
    }
  }
};