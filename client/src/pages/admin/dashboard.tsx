import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, LogOut, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();

  // Redirect if not authenticated (simple check, robust check via wrapper also works)
  if (!authLoading && !user) {
    setLocation("/login");
    return null;
  }

  const totalRevenue = orders?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  const totalProducts = products?.length || 0;

  return (
    <div className="min-h-screen bg-secondary/10 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-display font-bold text-primary">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard">
            <Button variant="secondary" className="w-full justify-start font-medium bg-primary/10 text-primary hover:bg-primary/20">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">
              <Package className="mr-2 h-4 w-4" /> Products
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">
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

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold">Dashboard Overview</h1>
          <div className="text-sm text-muted-foreground">
            Welcome back, <span className="font-bold text-foreground">{user?.username}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Revenue" value={`$${(totalRevenue / 100).toFixed(2)}`} icon={DollarSign} loading={ordersLoading} />
          <StatCard title="Total Orders" value={totalOrders.toString()} icon={ShoppingCart} loading={ordersLoading} />
          <StatCard title="Pending Orders" value={pendingOrders.toString()} icon={TrendingUp} loading={ordersLoading} highlight />
          <StatCard title="Total Products" value={totalProducts.toString()} icon={Package} loading={productsLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-bold">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(order.totalAmount / 100).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link href="/admin/orders">
                    <Button variant="link" className="w-full mt-2">View All Orders</Button>
                  </Link>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No orders yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/products">
                <Button className="w-full justify-start h-12 text-lg">
                  <Package className="mr-2 h-5 w-5" /> Add New Product
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="secondary" className="w-full justify-start h-12 text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Manage Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading, highlight = false }: any) {
  return (
    <Card className={highlight ? "border-primary/50 bg-primary/5" : ""}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? <Skeleton className="h-8 w-20" /> : <h3 className="text-3xl font-bold font-display">{value}</h3>}
        </div>
        <div className={`p-3 rounded-full ${highlight ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
