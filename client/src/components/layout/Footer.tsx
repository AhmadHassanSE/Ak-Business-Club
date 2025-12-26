import { ChefHat, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="text-xl font-display font-bold">AK Traders</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Serving the finest quality kababs, sauces, and culinary delights since 2010. Taste the difference quality makes.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Menu</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">Our Story</a></li>
              <li><a href="/cart" className="hover:text-primary transition-colors">Cart</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Food Street, Flavor Town</li>
              <li>+1 (555) 123-4567</li>
              <li>hello@aktraders.com</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AK Traders. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
