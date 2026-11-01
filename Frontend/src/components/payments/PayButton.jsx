import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi } from "@/lib/api";
import { CreditCard, CheckCircle2 } from "lucide-react";

/**
 * Pays for an appointment / lab booking / pharmacy order.
 * The amount is computed by the server from the item itself - the client never sends it.
 */
export default function PayButton({ kind, refId, amount, paid, onPaid, label = "Pay now" }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  if (paid) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
        <CheckCircle2 className="w-4 h-4" /> Paid
      </span>
    );
  }

  const pay = async () => {
    setBusy(true);
    try {
      const { transaction } = await paymentsApi.createIntent(kind, refId);
      try {
        // Sandbox (mock provider): confirm immediately. With a real gateway the server rejects this
        // call and the customer is sent to the gateway's checkout instead.
        await paymentsApi.confirmSandbox(transaction._id);
        toast({ title: "Payment received", description: `PKR ${transaction.amount} paid.` });
        onPaid?.();
      } catch (err) {
        if (err.status === 403) {
          toast({ title: "Payment started", description: "Complete the payment in the gateway window.", });
        } else {
          throw err;
        }
      }
    } catch (err) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={pay} disabled={busy} size="sm" className="rounded-xl gap-1.5">
      <CreditCard className="w-4 h-4" />
      {busy ? "Processing…" : `${label}${amount ? ` · PKR ${amount}` : ""}`}
    </Button>
  );
}
