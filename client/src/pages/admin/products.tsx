import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

// For form handling
const productFormSchema = insertProductSchema.extend({
  price: z.coerce.number().min(0, "Price must be positive"), // Handle string -> number coercion
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AdminProducts() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/10 flex">
      {/* Sidebar (Duplicated for simplicity, ideally a component) */}
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
            <Button variant="secondary" className="w-full justify-start font-medium bg-primary/10 text-primary hover:bg-primary/20">
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

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold">Manage Products</h1>
          <Button onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </header>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover bg-secondary" />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${(product.price / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {product.available ? "Available" : "Sold Out"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteButton id={product.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <ProductDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        product={editingProduct} 
      />
    </div>
  );
}

function DeleteButton({ id }: { id: number }) {
  const { mutate, isPending } = useDeleteProduct();
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-destructive hover:bg-destructive/10"
      disabled={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to delete this product?")) {
          mutate(id);
        }
      }}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

function ProductDialog({ open, onOpenChange, product }: { open: boolean, onOpenChange: (open: boolean) => void, product: Product | null }) {
  const { mutate: create, isPending: isCreating } = useCreateProduct();
  const { mutate: update, isPending: isUpdating } = useUpdateProduct();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "Sauces",
      available: true,
    },
  });

  // Reset form when dialog opens/closes or product changes
  useState(() => {
    if (open) {
      if (product) {
        form.reset(product);
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          imageUrl: "",
          category: "Sauces",
          available: true,
        });
      }
    }
  });

  const onSubmit = (data: ProductFormValues) => {
    if (product) {
      update({ id: product.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      create(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Spicy Kebab Sauce" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (in cents)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sauces">Sauces</SelectItem>
                        <SelectItem value="Frozen">Frozen</SelectItem>
                        <SelectItem value="Kababs">Kababs</SelectItem>
                        <SelectItem value="Spices">Spices</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Available</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {product ? "Update Product" : "Create Product"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
