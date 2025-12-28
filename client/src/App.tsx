import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
