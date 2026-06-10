import { useEffect, useState } from "react";
import { usePayments } from "@/hooks/useFirestore";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Receipt, AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { PaymentStatus } from "@/types";

const StudentPayments = () => {
  const { studentProfile } = useStore();
  const { data: allPayments, fetchAll } = usePayments();

  useEffect(() => {
    fetchAll();
  }, []);

  const myPayments = allPayments.filter((p) => p.studentId === studentProfile?.id);

  const statusColors: Record<PaymentStatus, string> = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    partially_paid: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    unpaid: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const totalPaid = myPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalBalance = myPayments.reduce((sum, p) => sum + p.balance, 0);
  const totalFees = myPayments.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102542] dark:text-white flex items-center gap-2">
          <CreditCard size={24} />
          My Payments
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View your fee payment history
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Fees</p>
                <p className="text-2xl font-bold text-[#102542] dark:text-white">N{totalFees.toLocaleString()}</p>
              </div>
              <Receipt size={24} className="text-[#1E3A8A]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-2xl font-bold text-[#059669]">N{totalPaid.toLocaleString()}</p>
              </div>
              <CheckCircle size={24} className="text-[#059669]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-2xl font-bold text-red-600">N{totalBalance.toLocaleString()}</p>
              </div>
              <AlertCircle size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        {myPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No payment records found</p>
          </div>
        ) : (
          myPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {payment.feeType.replace(/-/g, " ")}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(statusColors as any)[payment.status]}`}>
                        {payment.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {payment.class} | {payment.term} | {payment.session}
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-medium">N{payment.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="text-sm font-medium text-green-600">N{payment.amountPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="text-sm font-medium text-red-600">N{payment.balance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {payment.installments.map((inst: any) => (
                      <div
                        key={inst.id}
                        className={`px-3 py-2 rounded-lg text-xs font-medium ${
                          inst.paid
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {inst.paid ? <CheckCircle size={12} /> : <Clock size={12} />}
                          <span>N{inst.amount}</span>
                        </div>
                        {inst.paid && inst.receiptNumber && (
                          <p className="text-[10px] mt-1">{inst.receiptNumber}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentPayments;
