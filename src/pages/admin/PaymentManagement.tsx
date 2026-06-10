import { useState, useEffect } from "react";
import { usePayments, useStudents } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Receipt,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { CLASSES, TERMS, type Payment, type PaymentPlan, type PaymentStatus, type ClassLevel, type Term } from "@/types";
import toast from "react-hot-toast";

const PAYMENT_PLANS: { value: PaymentPlan; label: string }[] = [
  { value: "one_time", label: "One-time Payment" },
  { value: "two_installments", label: "Two Installments" },
  { value: "three_installments", label: "Three Installments" },
  { value: "four_installments", label: "Four Installments" },
];

const PaymentManagement = () => {
  const { data: payments, loading, fetchAll, create, update } = usePayments();
  const { data: students, fetchAll: fetchStudents } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    feeType: "school-fees",
    totalAmount: 0,
    paymentPlan: "one_time" as PaymentPlan,
    term: "First Term" as Term,
    session: "2025/2026",
    class: "JSS1" as ClassLevel,
  });

  useEffect(() => {
    fetchAll();
    fetchStudents();
  }, []);

  const handleCreatePayment = async () => {
    try {
      const student = students.find((s) => s.id === formData.studentId);
      if (!student) {
        toast.error("Please select a student");
        return;
      }

      const numInstallments =
        formData.paymentPlan === "one_time" ? 1 :
        formData.paymentPlan === "two_installments" ? 2 :
        formData.paymentPlan === "three_installments" ? 3 : 4;

      const installmentAmount = Math.floor(formData.totalAmount / numInstallments);
      const installments = Array.from({ length: numInstallments }, (_, i) => ({
        id: `inst-${i + 1}`,
        amount: i === numInstallments - 1
          ? formData.totalAmount - installmentAmount * (numInstallments - 1)
          : installmentAmount,
        paid: false,
      }));

      await create({
        studentId: student.id,
        studentName: student.name,
        class: formData.class,
        term: formData.term,
        session: formData.session,
        feeType: formData.feeType,
        totalAmount: formData.totalAmount,
        amountPaid: 0,
        balance: formData.totalAmount,
        paymentPlan: formData.paymentPlan,
        installments,
        status: "unpaid",
      });

      setShowDialog(false);
      fetchAll();
      toast.success("Payment record created");
    } catch (error) {
      toast.error("Failed to create payment");
    }
  };

  const handleRecordPayment = async (payment: Payment, installmentId: string) => {
    try {
      const installment = payment.installments.find((i) => i.id === installmentId);
      if (!installment || installment.paid) return;

      const updatedInstallments = payment.installments.map((i) =>
        i.id === installmentId
          ? { ...i, paid: true, paidAt: new Date().toISOString(), receiptNumber: `RCP-${Date.now()}` }
          : i
      );

      const totalPaid = updatedInstallments.filter((i) => i.paid).reduce((sum, i) => sum + i.amount, 0);
      const balance = payment.totalAmount - totalPaid;

      let status: PaymentStatus = "partially_paid";
      if (balance <= 0) status = "paid";
      else if (totalPaid === 0) status = "unpaid";

      await update(payment.id, {
        installments: updatedInstallments,
        amountPaid: totalPaid,
        balance,
        status,
        receiptNumber: status === "paid" ? `RCP-${Date.now()}` : payment.receiptNumber,
      });

      toast.success("Payment recorded");
      fetchAll();
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || payment.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOutstanding = payments.reduce((sum, p) => sum + p.balance, 0);
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const unpaidCount = payments.filter((p) => p.status === "unpaid").length;

  const statusColors: Record<PaymentStatus, string> = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    partially_paid: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    unpaid: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
            <CreditCard size={24} />
            Payment Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage school fees and payments
          </p>
        </div>
        <Button className="bg-[#0891B2] hover:bg-[#0e7490]" onClick={() => setShowDialog(true)}>
          <Plus size={16} className="mr-2" />
          Create Fee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Collected</p>
                <p className="text-lg font-bold">N{totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className="text-lg font-bold">N{totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-lg font-bold">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Receipt size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Unpaid</p>
                <p className="text-lg font-bold">{unpaidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by student or fee type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-40">
                <Filter size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payments ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#0891B2] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No payment records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Class</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fee Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Paid</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Balance</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Installments</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{payment.studentName}</p>
                        <p className="text-xs text-gray-500">{payment.term} {payment.session}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{payment.class}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 capitalize">{payment.feeType}</td>
                      <td className="py-3 px-4 text-sm font-medium">N{payment.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-green-600">N{payment.amountPaid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-red-600">N{payment.balance.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(statusColors as any)[payment.status]}`}>
                          {payment.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {payment.installments.map((inst: any) => (
                            <button
                              key={inst.id}
                              onClick={() => handleRecordPayment(payment, inst.id)}
                              disabled={inst.paid}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                inst.paid
                                  ? "bg-green-100 text-green-700 cursor-default"
                                  : "bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700"
                              }`}
                              title={inst.paid ? `Paid on ${new Date(inst.paidAt || "").toLocaleDateString()}` : `Pay N${inst.amount}`}
                            >
                              {inst.paid ? "Paid" : `N${inst.amount}`}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Fee Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={formData.studentId} onValueChange={(v) => {
                const student = students.find((s) => s.id === v);
                setFormData({ ...formData, studentId: v, class: student?.class || "JSS1" });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.class})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fee Type</Label>
              <Input
                value={formData.feeType}
                onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                placeholder="e.g., school-fees, excursion, exam-fees"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Amount (N)</Label>
              <Input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                placeholder="Enter amount"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={formData.term} onValueChange={(v) => setFormData({ ...formData, term: v as Term })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Session</Label>
                <Input
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Plan</Label>
              <Select value={formData.paymentPlan} onValueChange={(v) => setFormData({ ...formData, paymentPlan: v as PaymentPlan })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="bg-[#0891B2] hover:bg-[#0e7490]" onClick={handleCreatePayment}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
