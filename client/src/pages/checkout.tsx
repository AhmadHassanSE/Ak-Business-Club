import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { insertOrderSchema } from "@shared/schema";

// Schema for the form UI (without items array which we add from cart store)
const checkoutFormSchema = insertOrderSchema.pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  customerAddress: true,
}).extend({
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number too short"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [, setLocation] = useLocation();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    if (items.length === 0) return;

    createOrder({
      ...data,
      totalAmount: total() + 500, // Including delivery
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    }, {
      onSuccess: () => {
        clearCart();
        setLocation("/order-success"); // Assuming success page or back to home
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Button onClick={() => setLocation("/")}>Go to Menu</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-display font-bold mb-8 text-center">Checkout</h1>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 h-fit bg-secondary/30 border-none">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total (with delivery)</span>
                <span className="text-primary">${((total() + 500) / 100).toFixed(2)}</span>
              </div>
            </Card>

            <Card className="p-8 border-primary/10 shadow-lg">
              <h2 className="text-xl font-bold mb-6">Delivery Details</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="rounded-lg h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} className="rounded-lg h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} className="rounded-lg h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="123 Main St, Apt 4B..." 
                            {...field} 
                            className="rounded-lg min-h-[100px]" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-bold rounded-xl mt-4" 
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      `Pay $${((total() + 500) / 100).toFixed(2)}`
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
