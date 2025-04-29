import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRightIcon, 
  Box, 
  CreditCard, 
  DollarSign, 
  ListOrderedIcon, 
  PackageIcon, 
  PlusIcon, 
  ShoppingBag, 
  ShoppingCart, 
  TagIcon, 
  Truck, 
  UserIcon, 
  UsersIcon 
} from "lucide-react";

const QuickActions = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Button
            asChild
            variant="outline"
            className="h-24 p-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <Link to="/admin/products/add">
              <PlusIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Add Product</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-24 p-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <Link to="/admin/orders">
              <ListOrderedIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Manage Orders</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-24 p-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <Link to="/admin/products">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs font-medium">Manage Products</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-24 p-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <Link to="/admin/inventory">
              <PackageIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Inventory</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-24 p-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <Link to="/admin/promotions">
              <TagIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Promotions</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-24 p-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <Link to="/admin/users">
              <UsersIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Customers</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-24 p-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <Link to="/admin/delivery-slots">
              <Truck className="h-5 w-5" />
              <span className="text-xs font-medium">Delivery Slots</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="h-24 p-3 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
          >
            <Link to="/admin/payments">
              <CreditCard className="h-5 w-5" />
              <span className="text-xs font-medium">Payments</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
