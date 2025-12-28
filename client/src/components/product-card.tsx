import { type Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, Minus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCartWithQuantity = useCart((state) => state.addToCartWithQuantity);
  const [isAdded, setIsAdded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    addToCartWithQuantity(product, quantity);
    setIsAdded(true);
    setIsDialogOpen(false);
    setQuantity(1);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const increaseQuantity = () => {
    setQuantity(q => q + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full flex flex-col border-none shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
          {!product.available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg px-4 py-2 border-2 border-white rounded-md">
                SOLD OUT
              </span>
            </div>
          )}
        </div>
        
        <CardContent className="flex-grow p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                {product.category}
              </p>
              <h3 className="font-display font-bold text-xl text-foreground line-clamp-1">
                {product.name}
              </h3>
            </div>
            <span className="font-bold text-lg text-primary">
              ${(product.price / 100).toFixed(2)}
            </span>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="p-6 pt-0 mt-auto">
          <Button 
            className={`w-full font-semibold transition-all duration-300 ${
              isAdded ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
            }`}
            onClick={handleAdd}
            disabled={!product.available || isAdded}
            data-testid={`button-add-to-order-${product.id}`}
          >
            {isAdded ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Added to Cart
              </span>
            ) : product.available ? (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add to Order
              </span>
            ) : (
              "Unavailable"
            )}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Quantity</DialogTitle>
              </DialogHeader>
              
              <div className="py-6">
                <div className="mb-2">
                  <p className="font-semibold text-lg text-foreground mb-4">{product.name}</p>
                  <p className="text-primary font-bold text-2xl mb-6">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Label htmlFor="quantity" className="text-foreground font-medium">
                    Quantity:
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="999"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0) setQuantity(val);
                      }}
                      className="w-20 text-center h-10"
                      data-testid="input-quantity"
                    />
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={increaseQuantity}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total:</p>
                  <p className="text-2xl font-bold text-primary">
                    ${((product.price * quantity) / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-quantity"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-confirm-quantity"
                >
                  Add {quantity} to Cart
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
