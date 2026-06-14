"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "@/components/universal/Loader";

const CustomizationForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    artwork: "",
    frame: "With Frame",
    size: "A4",
    material: "Canvas",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/send-customization", form);

      if (res.status === 200) {
        toast.success("Customization request sent!");
        router.push("/");
      } else {
        throw new Error("Failed to send email");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-slate-700">
        Customize Your Artwork
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={form.email}
          onChange={handleChange}
          required
        />{" "}
        <input
          type="tel"
          name="phone"
          placeholder="Your Phone Number"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="artwork"
          placeholder="Artwork Name or Reference"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={form.artwork}
          onChange={handleChange}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="frame"
            value={form.frame}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="With Frame">With Frame</option>
            <option value="Without Frame">Without Frame</option>
          </select>
          <select
            name="size"
            value={form.size}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="Custom">Custom Size</option>
          </select>
        </div>
        <select
          name="material"
          value={form.material}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="Canvas">Canvas</option>
          <option value="Paper">Paper</option>
          <option value="Digital Only">Digital Only</option>
        </select>
        <textarea
          name="notes"
          rows={4}
          placeholder="Any special instructions?"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={form.notes}
          onChange={handleChange}
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Sending..." : "Submit Customization"}
          {loading && <Loader />}
        </button>
      </form>
    </div>
  );
};

export default CustomizationForm;
