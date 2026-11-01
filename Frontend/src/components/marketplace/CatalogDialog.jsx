import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { API_BASE } from "@/lib/session";
import { X, ShoppingCart, Pill, FlaskConical } from "lucide-react";

/**
 * Shows everything one pharmacy sells (kind="product") or one laboratory offers (kind="lab_test"),
 * straight from that provider's own dashboard, with "Add to cart" for patients.
 */
export default function CatalogDialog({ kind, providerId, providerName, onClose }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isLab = kind === "lab_test";

  useEffect(() => {
    const path = isLab ? `laboratories/${providerId}/tests` : `pharmacies/${providerId}/products`;
    fetch(`${API_BASE}/marketplace/${path}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error || "Could not load the catalogue");
        setItems(isLab ? d.data.tests : d.data.products);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [kind, providerId, isLab]);

  const addToCart = async (item) => {
    if (user?.role !== "patient") {
      toast({ title: "Sign in as a patient", description: "You need a patient account to order.", variant: "destructive" });
      return;
    }
    const vendorId = item.vendorId?._id || item.vendorId;
    const payload = isLab
      ? { type: "lab_test", vendorId, labTestId: item._id, name: item.name, quantity: 1, unitPrice: item.price, totalPrice: item.price, homeCollection: false }
      : { type: "product", vendorId, productId: item._id, name: item.name, quantity: 1, unitPrice: item.price, totalPrice: item.price, prescriptionRequired: item.requiresPrescription };
    try {
      const res = await fetch(`${API_BASE}/marketplace/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add to cart");
      toast({ title: "Added to cart", description: item.name });
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const Icon = isLab ? FlaskConical : Pill;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{providerName}</h2>
            <p className="text-sm text-muted-foreground">{isLab ? "Available tests" : "Available products"}</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        {loading ? <p className="py-10 text-center text-muted-foreground">Loading…</p>
          : error ? <p className="py-10 text-center text-red-600">{error}</p>
          : items.length === 0 ? <p className="py-10 text-center text-muted-foreground">{isLab ? "This laboratory hasn't listed any tests yet." : "This pharmacy hasn't listed any products yet."}</p>
          : (
            <div className="space-y-3">
              {items.map((item) => {
                const outOfStock = !isLab && item.stock <= 0;
                return (
                  <div key={item._id} className="flex items-center gap-3 rounded-xl border p-3">
                    <div className="p-2 rounded-lg bg-secondary"><Icon className="w-5 h-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {isLab
                          ? `${item.category} · ${item.sampleType} · results in ${item.turnaroundHours}h${item.fastingRequired ? " · fasting" : ""}`
                          : `${item.genericName || item.category || ""}${item.requiresPrescription ? " · prescription required" : ""}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">PKR {item.price}</p>
                      {outOfStock && <p className="text-xs text-red-600">Out of stock</p>}
                    </div>
                    <Button size="sm" disabled={outOfStock} onClick={() => addToCart(item)} className="rounded-xl">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        <Button variant="outline" className="w-full mt-5 rounded-xl" onClick={() => { onClose(); navigate("/cart"); }}>
          View cart
        </Button>
      </div>
    </div>
  );
}
