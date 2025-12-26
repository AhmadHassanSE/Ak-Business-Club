import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Menu, X, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const itemCount = useCart((state) => state.itemCount());
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Menu" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const NavContent = ({ mobile = false }) => (
    <>
      {navLinks.map((link) => (
        <Link 
          key={link.href} 
          href={link.href}
          className={`
            font-medium transition-colors hover:text-primary 
            ${location === link.href ? "text-primary font-bold" : "text-foreground/80"}
            ${mobile ? "text-lg py-2" : ""}
          `}
          onClick={() => mobile && setIsOpen(false)}
        >
          {link.label}
        </Link>
      ))}
      {user && (
        <Link 
          href="/admin/dashboard" 
          className={`
            font-medium transition-colors hover:text-primary 
            ${location.startsWith("/admin") ? "text-primary font-bold" : "text-foreground/80"}
            ${mobile ? "text-lg py-2" : ""}
          `}
          onClick={() => mobile && setIsOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground">
            AK <span className="text-primary">Traders</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavContent />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Admin Login Button - Always Visible */}
          {!user && (
            <Link href="/login">
              <Button 
                variant="default" 
                className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Admin Login
              </Button>
            </Link>
          )}

          {user && (
            <Link href="/admin/dashboard">
              <Button 
                variant="default" 
                className="hidden sm:inline-flex bg-accent hover:bg-accent/80 text-accent-foreground font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Dashboard
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-10">
                  <NavContent mobile />
                  <div className="border-t pt-4 flex flex-col gap-3">
                    {!user ? (
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
                          Admin Login
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="default" className="w-full bg-accent hover:bg-accent/80">
                          Dashboard
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
