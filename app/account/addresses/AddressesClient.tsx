"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const emptyAddress = {
  fullName: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

const AddressesClient = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [form, setForm] = useState(emptyAddress);

  const load = async () => {
    const res = await fetch("/api/addresses");
    if (res.ok) setAddresses(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return toast.error("Login required or missing fields");
    setForm(emptyAddress);
    toast.success("Address saved");
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    toast.success("Address removed");
    load();
  };

  return (
    <div className="px-4 py-10 sm:px-8">
      <h1 className="text-5xl font-black uppercase">Addresses</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-xl font-black uppercase">Add new address</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Object.keys(emptyAddress).map((key) => (
              <input
                key={key}
                placeholder={key}
                value={(form as any)[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                className="h-12 border border-[var(--color-border)] px-3 text-sm"
              />
            ))}
          </div>
          <button
            onClick={save}
            className="mt-5 bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase text-[var(--color-bg)]"
          >
            Save address
          </button>
        </div>
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="font-black uppercase">{address.fullName}</p>
              <p className="mt-2 text-sm text-[var(--color-secondary)]">
                {address.line1}, {address.line2} {address.city}, {address.state} - {address.pincode}
              </p>
              <p className="mt-1 text-sm text-[var(--color-secondary)]">{address.phone}</p>
              <button
                onClick={() => remove(address.id)}
                className="mt-3 text-xs font-black uppercase text-[var(--color-accent-alt)]"
              >
                Remove
              </button>
            </div>
          ))}
          {addresses.length === 0 && <p className="text-[var(--color-secondary)]">No saved addresses yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AddressesClient;
