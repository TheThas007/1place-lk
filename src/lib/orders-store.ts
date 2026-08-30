import fs from "fs";
import path from "path";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  storage?: string;
  color?: string;
}

export interface OrderRecord {
  id: string;
  userId?: string;
  customerName: string;
  address: string;
  district: string;
  primaryPhone: string;
  secondaryPhone?: string;
  postalCode?: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
  status: string;
  paymentStatus?: string;
  payherePaymentId?: string;
  payhereVerified?: boolean;
  createdAt: string;
}

const ORDERS_FILE_PATH = path.join(process.cwd(), "src", "lib", "local-orders.json");

// Helper to load local orders
export function getLocalOrders(): OrderRecord[] {
  try {
    if (!fs.existsSync(ORDERS_FILE_PATH)) {
      // Seed with initial sample orders if empty
      const initialOrders: OrderRecord[] = [
        {
          id: "SM-7821A",
          userId: "guest",
          customerName: "Kamal Perera",
          primaryPhone: "0774141118",
          secondaryPhone: "0712345678",
          district: "Vavuniya",
          address: "No 45, Station Road, Vavuniya",
          postalCode: "43000",
          paymentMethod: "COD",
          status: "pending",
          totalPrice: 285000,
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          items: [
            {
              productId: "1",
              name: "iPhone 15 Pro Max",
              price: 285000,
              quantity: 1,
              storage: "256GB",
              color: "Natural Titanium",
              image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60"
            }
          ]
        },
        {
          id: "SM-4912B",
          userId: "guest",
          customerName: "Sivakumar N.",
          primaryPhone: "0768901234",
          district: "Jaffna",
          address: "Hospital Road, Jaffna",
          postalCode: "40000",
          paymentMethod: "Card",
          status: "paid",
          totalPrice: 165000,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          items: [
            {
              productId: "2",
              name: "Samsung Galaxy S24 Ultra",
              price: 165000,
              quantity: 1,
              storage: "512GB",
              color: "Titanium Black",
              image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60"
            }
          ]
        }
      ];
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(initialOrders, null, 2), "utf-8");
      return initialOrders;
    }

    const content = fs.readFileSync(ORDERS_FILE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading local orders file:", err);
    return [];
  }
}

// Helper to save a new order
export function saveLocalOrder(order: OrderRecord): OrderRecord {
  try {
    const orders = getLocalOrders();
    // Prepend new order
    const updated = [order, ...orders.filter((o) => o.id !== order.id)];
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return order;
  } catch (err) {
    console.error("Error saving local order file:", err);
    return order;
  }
}

// Helper to update status of an order
export function updateLocalOrderStatus(id: string, status: string): boolean {
  try {
    const orders = getLocalOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf-8");
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error updating local order status:", err);
    return false;
  }
}

// Helper to update arbitrary fields of an order
export function updateLocalOrder(id: string, updates: Partial<OrderRecord & Record<string, any>>): boolean {
  try {
    const orders = getLocalOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates };
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf-8");
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error updating local order fields:", err);
    return false;
  }
}

// Helper to delete an order
export function deleteLocalOrder(id: string): boolean {
  try {
    const orders = getLocalOrders();
    const filtered = orders.filter((o) => o.id !== id);
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error deleting local order:", err);
    return false;
  }
}
