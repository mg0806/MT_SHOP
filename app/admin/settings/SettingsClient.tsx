"use client";

import Heading from "@/components/universal/Heading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type SettingsClientProps = {
  settings: any;
};

const textFields = [
  { id: "storeName", label: "Store Name" },
  { id: "legalName", label: "Legal / Billing Name" },
  { id: "gstin", label: "GSTIN" },
  { id: "supportEmail", label: "Support Email" },
  { id: "supportPhone", label: "Support Phone" },
  { id: "shiprocketPickupName", label: "Shiprocket Pickup Location Name" },
  { id: "pickupContactName", label: "Pickup Contact Name" },
  { id: "pickupPhone", label: "Pickup Phone" },
  { id: "pickupEmail", label: "Pickup Email" },
  { id: "pickupAddressLine1", label: "Pickup Address Line 1" },
  { id: "pickupAddressLine2", label: "Pickup Address Line 2" },
  { id: "pickupCity", label: "Pickup City" },
  { id: "pickupState", label: "Pickup State" },
  { id: "pickupCountry", label: "Pickup Country" },
  { id: "pickupPincode", label: "Pickup Pincode" },
];

const numberFields = [
  { id: "defaultPackageLength", label: "Default Length (cm)" },
  { id: "defaultPackageBreadth", label: "Default Breadth (cm)" },
  { id: "defaultPackageHeight", label: "Default Height (cm)" },
  { id: "defaultPackageWeight", label: "Fallback Weight (kg)" },
];

const SettingsClient = ({ settings }: SettingsClientProps) => {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, any>>(settings);
  const [saving, setSaving] = useState(false);

  const setValue = (id: string, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/admin/settings", form);
      toast.success("Settings saved");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1150px] px-4 py-8">
      <div className="mt-8">
        <Heading title="Store Settings" center />
      </div>

      <div className="mt-6 grid gap-6">
        <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="fashion-kicker">Shiprocket Billing And Pickup</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {textFields.map((field) => (
              <label key={field.id} className="grid gap-2 text-sm font-bold text-[var(--color-primary)]">
                {field.label}
                <input
                  value={form[field.id] ?? ""}
                  onChange={(event) => setValue(field.id, event.target.value)}
                  className="min-h-12 border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm font-medium outline-none"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="fashion-kicker">Parcel Defaults</p>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {numberFields.map((field) => (
              <label key={field.id} className="grid gap-2 text-sm font-bold text-[var(--color-primary)]">
                {field.label}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[field.id] ?? ""}
                  onChange={(event) => setValue(field.id, event.target.value)}
                  className="min-h-12 border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm font-medium outline-none"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-12 bg-[var(--color-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)] transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsClient;
