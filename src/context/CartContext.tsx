import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { Product as SupabaseProduct } from "@/integrations/supabase/types.service";
import { ensureProductTypeCompatibility, mapSupabaseProductToAppProduct } from "@/types/supabase-types";

export interface CartItem {
  product: Product | SupabaseProduct;
  quantity: number;
}

export interface CartContextProps {
  items: CartItem[];
  cart: CartItem[];
  cartItemsCount: number;
  cartTotal: number;
  addItem: (product: Product | SupabaseProduct, quantity?: number) => void;
  addToCart: (product: Product | SupabaseProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemQuantity: (productId: string) => number;
}

const CART_STORAGE_KEY = 'glassgrocer_cart_v2';

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  const getTotal = () => {
    return items.reduce(
      (total, item) => total + (item.product.price || 0) * item.quantity,
      0
    );
  };

  const cartTotal = getTotal();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            const validatedCart = parsedCart
              .filter(item => {
                return item && 
                  item.product && 
                  typeof item.product === 'object' &&
                  item.product.id &&
                  typeof item.quantity === 'number' &&
                  item.quantity > 0;
              })
              .map(item => ({
                product: mapSupabaseProductToAppProduct(item.product),
                quantity: item.quantity
              }));
            
            if (validatedCart.length > 0) {
              setItems(validatedCart);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const saveCart = () => {
      try {
        const cartToSave = items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            description: item.product.description,
            category_id: item.product.category_id,
            featured: item.product.featured,
            is_new: item.product.is_new,
            discount: item.product.discount,
            category: item.product.category,
            unit: item.product.unit,
            stock: item.product.stock,
            created_at: item.product.created_at,
            updated_at: item.product.updated_at,
          },
          quantity: item.quantity
        }));
        
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToSave));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    };

    if (items.length > 0) {
      saveCart();
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [items]);

  const addItem = (product: Product | SupabaseProduct, quantity = 1) => {
    const normalizedProduct = mapSupabaseProductToAppProduct(product);
    
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === normalizedProduct.id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        
        toast({
          title: "Cart updated",
          description: `${normalizedProduct.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        });
        
        return updatedItems;
      } else {
        toast({
          title: "Item added to cart",
          description: `${normalizedProduct.name} added to your cart`,
        });
        
        return [...prevItems, { product: normalizedProduct, quantity }];
      }
    });
  };

  const addToCart = addItem;

  const removeItem = (productId: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find(
        (item) => item.product.id === productId
      );
      
      if (itemToRemove) {
        toast({
          title: "Item removed",
          description: `${itemToRemove.product.name} removed from your cart`,
        });
      }
      
      return prevItems.filter((item) => item.product.id !== productId);
    });
  };

  const removeFromCart = removeItem;

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cart: items,
        cartItemsCount,
        cartTotal,
        addItem,
        addToCart,
        removeItem,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
