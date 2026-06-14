"use client";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

interface BannerData {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  offerText: string;
  bannerImage?: string;
}

export default function BannerAdmin() {
  const [form, setForm] = useState<BannerData>({
    titleLine1: "",
    titleLine2: "",
    subtitle: "",
    offerText: "",
    bannerImage: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/banner")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm({
            titleLine1: data.titleLine1 || "",
            titleLine2: data.titleLine2 || "",
            subtitle: data.subtitle || "",
            offerText: data.offerText || "",
            bannerImage: data.bannerImage || "",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching banner:", error);
        toast.error("Failed to load banner data");
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await axios.post("/api/upload-images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.urls && response.data.urls.length > 0) {
        setForm({ ...form, bannerImage: response.data.urls[0] });
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = async () => {
    if (!form.bannerImage) return;

    try {
      await axios.post("/api/delete-images", { urls: [form.bannerImage] });
      setForm({ ...form, bannerImage: "" });
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Image removal error:", error);
      toast.error("Failed to remove image");
    }
  };

  const saveBanner = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        toast.success("Banner updated successfully!");
      } else {
        throw new Error("Failed to save banner");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Home Banner
          </h1>
          <p className="mt-2 text-gray-600">
            Customize your homepage banner with text and a full background image
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Banner Text
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title Line 1
                  </label>
                  <input
                    name="titleLine1"
                    value={form.titleLine1}
                    onChange={handleChange}
                    placeholder="Enter first title line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title Line 2
                  </label>
                  <input
                    name="titleLine2"
                    value={form.titleLine2}
                    onChange={handleChange}
                    placeholder="Enter second title line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <textarea
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="Enter subtitle text"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Text
                  </label>
                  <input
                    name="offerText"
                    value={form.offerText}
                    onChange={handleChange}
                    placeholder="Enter offer or call-to-action text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Banner Image
              </h2>

              <div className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploadingImage ? "Uploading..." : "Upload New Image"}
                  </button>
                </div>

                {form.bannerImage && (
                  <div className="relative">
                    <img
                      src={form.bannerImage}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-md border border-gray-300"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveBanner}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Live Preview
              </h2>

              <div
                className="relative rounded-xl overflow-hidden p-6"
                style={{
                  minHeight: "300px",
                  backgroundImage: form.bannerImage
                    ? `url(${form.bannerImage})`
                    : "linear-gradient(to right, #0ea5e9, #ef4444)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Text Preview */}
                  <div className="text-center md:text-left flex-1 text-white">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">
                      {form.titleLine1 || "Title Line 1"}
                    </h1>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4">
                      {form.titleLine2 || "Title Line 2"}
                    </h1>
                    <p className="text-sm md:text-lg mb-4">
                      {form.subtitle || "Your subtitle text goes here"}
                    </p>
                    <p className="text-lg md:text-2xl text-yellow-200 font-bold">
                      {form.offerText || "Special Offer!"}
                    </p>
                  </div>

                  {/* Image Preview */}
                  <div className="flex-1 w-full max-w-xs relative aspect-video">
                    {form.bannerImage ? (
                      <img
                        src={form.bannerImage}
                        alt="Banner preview"
                        className="object-contain rounded-lg w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center border-2 border-dashed border-white/30">
                        <span className="text-white/60 text-sm">
                          Image Preview
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
