// app/dashboard/orders/page.tsx
import { PharmacyOrdersDashboard } from "@/components/facilities/pharmacy-orders"

export const metadata = {
  title: "Order Reservations | Pharmacy Dashboard",
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-background py-6">
      <PharmacyOrdersDashboard />
    </main>
  )
}