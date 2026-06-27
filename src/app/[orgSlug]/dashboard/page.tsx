import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Users, CreditCard, ChevronRight, Bell, TrendingUp } from "lucide-react"
import Link from "next/link"
import { RevenueChart } from "./revenue-chart"

export default async function TenantDashboard({
  params
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const session = await auth()
  const { orgSlug } = await params

  if (!session?.user?.id) redirect("/login")

  // Find the org by slug to get its ID
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug }
  })

  if (!org) redirect("/orgs")

  // Fetch data specific to THIS organization
  const coursesCount = await prisma.course.count({
    where: { organizationId: org.id }
  })
  
  const studentsCount = await prisma.student.count({
    where: { organizationId: org.id }
  })

  // Aggregate payment data for this org
  const invoices = await prisma.invoice.findMany({
    where: {
      student: {
        organizationId: org.id
      }
    }
  })

  const amountCollected = invoices
    .filter(req => req.status === "PAID")
    .reduce((sum, req) => sum + req.amount, 0)
    
  const amountDue = invoices
    .filter(req => req.status === "OPEN" || req.status === "OVERDUE")
    .reduce((sum, req) => sum + req.amount, 0)

  // Chart data aggregation
  const monthlyRevenueMap: Record<string, number> = {};
  invoices.filter(i => i.status === "PAID" && i.paidAt).forEach(invoice => {
    const month = invoice.paidAt!.toLocaleString('default', { month: 'short' });
    monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + invoice.amount;
  });
  
  const revenueData = Object.keys(monthlyRevenueMap).length > 0 
    ? Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({ month, revenue }))
    : [
        { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 },
        { month: 'Apr', revenue: 0 }, { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 }
      ]; // Fallback empty data for display

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-zinc-400 mt-1">Here's what's happening in {org.name} today.</p>
        </div>
        <button className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors border border-zinc-800">
          <Bell size={20} className="text-zinc-300" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-zinc-400 text-sm font-medium flex items-center gap-2"><CreditCard size={16}/> Collected</h3>
          <p className="text-3xl font-bold mt-2 text-green-400">₹{amountCollected.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-zinc-400 text-sm font-medium flex items-center gap-2"><CreditCard size={16}/> Due</h3>
          <p className="text-3xl font-bold mt-2 text-red-400">₹{amountDue.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <h3 className="text-zinc-400 text-sm font-medium">Total Courses</h3>
          <p className="text-3xl font-bold mt-2 text-white">{coursesCount}</p>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <h3 className="text-zinc-400 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold mt-2 text-white">{studentsCount}</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-green-500"/> Revenue Analytics</h2>
        <RevenueChart data={revenueData} />
      </div>

      <h2 className="text-xl font-semibold pt-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href={`/${org.slug}/courses`} className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-950 rounded-xl group-hover:scale-110 transition-transform">
              <Users size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Manage Courses</h3>
              <p className="text-sm text-zinc-400">Add or edit courses & enrollments</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-zinc-500 group-hover:text-white transition-colors" />
        </Link>

        <Link href={`/${org.slug}/payments`} className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-950 rounded-xl group-hover:scale-110 transition-transform">
              <CreditCard size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Payment Requests</h3>
              <p className="text-sm text-zinc-400">Instantly request fees</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-zinc-500 group-hover:text-white transition-colors" />
        </Link>
      </div>
    </div>
  )
}
