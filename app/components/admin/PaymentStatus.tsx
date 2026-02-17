"use client";

import AnimatedCounter from "@/app/components/AnimatedCounter";

interface Props {
  completionRate: number;
}

export default function PaymentStatus({
  completionRate,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">
        Payment Completion
      </h3>

      <div className="text-4xl font-bold text-green-600">
        <AnimatedCounter value={completionRate} />%
      </div>
    </div>
  );
}