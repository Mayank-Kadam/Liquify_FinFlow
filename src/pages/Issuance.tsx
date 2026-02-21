import { useState, useMemo, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { type PropertyType } from "@/lib/mockData";
import { motion } from "framer-motion";
import {
  Rocket,
  Users,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function Issuance() {
  const { offerings, createOffering, simulateDemand } = useAppStore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    location: "",
    propertyType: "Commercial" as PropertyType,
    valuation: "",
    totalTokens: "",
  });

  // 🔥 AUTO TOKEN PRICE
  const tokenPrice = useMemo(() => {
    const valuation = parseFloat(form.valuation);
    const totalTokens = parseInt(form.totalTokens);
    if (!valuation || !totalTokens || totalTokens <= 0) return 0;
    return valuation / totalTokens;
  }, [form.valuation, form.totalTokens]);

  // 🔥 ECONOMIC PREVIEW
  const economics = useMemo(() => {
    if (!tokenPrice) return null;

    const totalTokens = parseInt(form.totalTokens);
    const publicTokens = Math.floor(totalTokens * 0.8);
    const liquidityTokens = totalTokens - publicTokens;

    return {
      publicTokens,
      liquidityTokens,
      publicCapital: publicTokens * tokenPrice,
      liquidityCapital: liquidityTokens * tokenPrice,
    };
  }, [form.totalTokens, tokenPrice]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valuation = parseFloat(form.valuation);
    const totalTokens = parseInt(form.totalTokens);

    if (!form.name || !form.location || !valuation || !totalTokens || !imagePreview) {
      toast.error("Please complete all required fields.");
      return;
    }

    createOffering({
      name: form.name,
      location: form.location,
      propertyType: form.propertyType,
      valuation,
      totalTokens,
      tokenPrice,
      imageUrl: imagePreview,
    });

    toast.success("Primary offering launched!");

    setForm({
      name: "",
      location: "",
      propertyType: "Commercial",
      valuation: "",
      totalTokens: "",
    });
    setImagePreview(null);
    setSelectedFileName(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Primary Issuance
        </h1>
        <p className="text-sm text-muted-foreground">
          Launch tokenized real estate offerings • IPO-style capital formation
        </p>
      </motion.div>

      {/* FORM */}
      <div className="card-glass rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Launch New Offering
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs uppercase text-muted-foreground">
              Property Image
            </label>
            <div className="border border-border rounded-lg p-3 bg-muted flex items-center gap-4">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                    setSelectedFileName(e.target.files[0].name);
                  }
                }}
              />

              <div className="w-28 h-20 bg-card rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-muted-foreground">No image</div>
                )}
              </div>

              <div className="flex-1">
                <div className="text-sm text-foreground font-medium">{selectedFileName ?? 'Choose an image'}</div>
                <div className="text-xs text-muted-foreground">PNG, JPG — up to 5MB</div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/30"
                  >
                    <Upload className="w-4 h-4" /> Browse
                  </button>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFileName(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-transparent text-muted-foreground border border-border"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <input
            placeholder="Property Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-muted border border-border rounded-lg px-3 py-2"
          />

          {/* Location */}
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="bg-muted border border-border rounded-lg px-3 py-2"
          />

          {/* Valuation */}
          <input
            type="number"
            placeholder="Valuation ($)"
            value={form.valuation}
            onChange={(e) => setForm({ ...form, valuation: e.target.value })}
            className="bg-muted border border-border rounded-lg px-3 py-2"
          />

          {/* Total Tokens */}
          <input
            type="number"
            placeholder="Total Tokens"
            value={form.totalTokens}
            onChange={(e) => setForm({ ...form, totalTokens: e.target.value })}
            className="bg-muted border border-border rounded-lg px-3 py-2"
          />

          {/* AUTO TOKEN PRICE */}
          <div className="bg-muted border border-border rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground uppercase">Auto Token Price</p>
            <p className="font-mono text-lg text-foreground">
              ${tokenPrice.toFixed(2)}
            </p>
          </div>

          <button
            type="submit"
            className="col-span-full py-2 rounded-lg bg-primary/10 text-primary font-semibold border border-primary/30"
          >
            Launch Primary Offering
          </button>
        </form>

        {/* ECONOMIC PREVIEW */}
        {economics && (
          <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">
              Offering Economics Preview
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p>Public Allocation (80%)</p>
                <p className="font-mono">
                  {economics.publicTokens.toLocaleString()} tokens
                </p>
              </div>
              <div>
                <p>Liquidity Allocation (20%)</p>
                <p className="font-mono">
                  {economics.liquidityTokens.toLocaleString()} tokens
                </p>
              </div>
              <div>
                <p>Capital Raised</p>
                <p className="font-mono text-gain">
                  ${economics.publicCapital.toLocaleString()}
                </p>
              </div>
              <div>
                <p>Initial Liquidity Pool</p>
                <p className="font-mono">
                  ${economics.liquidityCapital.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LIFECYCLE STRIP */}
        <div className="flex justify-between text-xs text-muted-foreground mt-4">
          <span>Primary Offering</span>
          <span>Liquidity Seeding</span>
          <span>Secondary AMM Trading</span>
        </div>
      </div>
    </div>
  );
}