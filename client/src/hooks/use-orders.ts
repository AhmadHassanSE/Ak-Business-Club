import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, createOrderSchema } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type CreateOrderInput = z.infer<typeof createOrderSchema>;

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: [api.orders.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.orders.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Order not found");
      return api.orders.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create order");
      }
      
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Order Received!", description: "We'll start preparing your food right away." });
    },
    onError: (err) => {
      toast({ title: "Order Failed", description: err.message, variant: "destructive" });
    },
  });
}
