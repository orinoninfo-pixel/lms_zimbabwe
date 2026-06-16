import { AdminTransactionsTable } from "@/components/admin/admin-transactions-table"

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">Monitor revenue, payouts, and platform transactions</p>
      </div>
      <AdminTransactionsTable />
    </div>
  )
}
