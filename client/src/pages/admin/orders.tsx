import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Loader2, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Separator } from "@/components/ui/separator";

export default function AdminOrders() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = useOrders();

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/10 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-display font-bold text-primary">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">
              <Package className="mr-2 h-4 w-4" /> Products
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="secondary" className="w-full justify-start font-medium bg-primary/10 text-primary hover:bg-primary/20">
              <ShoppingCart className="mr-2 h-4 w-4" /> Orders
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold">Manage Orders</h1>
        </header>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>${(order.totalAmount / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'pending' ? 'outline' : 'default'} className={order.status === 'pending' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : 'bg-green-600'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <OrderDetailsButton orderId={order.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

function OrderDetailsButton({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useQuery({
    queryKey: [api.orders.get.path, orderId],
    queryFn: async () => {
      const url = buildUrl(api.orders.get.path, { id: orderId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch order details");
      return api.orders.get.responses[200].parse(await res.json());
    },
    enabled: false // Only fetch on open - handled by Sheet behavior usually but here we lazy load content
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-2" /> View
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order #{orderId}</SheetTitle>
        </SheetHeader>
        
        {!order ? (
          <div className="flex justify-center py-10">
            <Button variant="outline" onClick={(e) => {
              // Trigger fetch manually if needed, or rely on react-query fetching when component mounts if enabled was true
              // Since enabled is false, we can't easily trigger it here without more state. 
              // Better pattern: Let it fetch when rendered.
            }}>
              Load Details
            </Button>
            {/* Quick fix: Render a component that fetches on mount */}
            <OrderDetailsContent orderId={orderId} />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function OrderDetailsContent({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useQuery({
    queryKey: [api.orders.get.path, orderId],
    queryFn: async () => {
      const url = buildUrl(api.orders.get.path, { id: orderId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch order details");
      return api.orders.get.responses[200].parse(await res.json());
    }
  });

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;
  if (!order) return <div>Failed to load</div>;

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Customer Info</h3>
        <p className="font-bold text-lg">{order.customerName}</p>
        <p>{order.customerEmail}</p>
        <p>{order.customerPhone}</p>
        <p className="mt-2 text-sm bg-secondary p-3 rounded-md">{order.customerAddress}</p>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center font-bold text-xs">
                  {item.quantity}x
                </div>
                <div>
                  <p className="font-medium text-sm">{item.product.name}</p>
                </div>
              </div>
              <p className="font-medium text-sm">${((item.price * item.quantity) / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex justify-between items-center pt-2">
        <span className="font-bold text-lg">Total Amount</span>
        <span className="font-bold text-xl text-primary">${(order.totalAmount / 100).toFixed(2)}</span>
      </div>

      <div className="pt-6">
        <Button className="w-full">Mark as Completed</Button>
      </div>
    </div>
  );
}
