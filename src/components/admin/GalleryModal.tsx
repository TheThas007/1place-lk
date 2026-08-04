import { useState, useEffect } from "react";
import { X, Upload, Loader2, Link } from "lucide-react";
import { GalleryImage } from "@/lib/types";
import { db, storage } from "@/lib/firebase";
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uploadImageWithFallback } from "@/lib/upload-utils";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: GalleryImage | null;
}

export default function GalleryModal({ isOpen, onClose, onSave, initialData }: GalleryModalProps) {
  const [formData, setFormData] = useState<Partial<GalleryImage>>({
    image_url: "",
    caption: "",
    category: "shop",
    sort_order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.image_url || "");
    } else {
      setFormData({
        image_url: "",
        caption: "",
        category: "shop",
        sort_order: 0,
      });
      setImagePreview("");
    }
    setImageFile(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear URL input if a file is chosen
      setFormData({ ...formData, image_url: "" });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = formData.image_url || "";

      // Upload image if a new one is selected
      if (imageFile) {
        finalImageUrl = await uploadImageWithFallback(imageFile, "gallery");
      }

      if (!finalImageUrl) {
        alert("Please provide an image URL or upload a file.");
        setIsLoading(false);
        return;
      }

      const galleryData = {
        ...formData,
        image_url: finalImageUrl,
      };

      if (initialData && initialData.id) {
        // Edit
        await updateDoc(doc(db, "gallery", initialData.id), galleryData);
      } else {
        // Add
        await addDoc(collection(db, "gallery"), galleryData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving gallery image:", error);
      alert("Failed to save gallery image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-white/10 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">
            {initialData ? "Edit Gallery Image" : "Add Gallery Image"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Image Upload or URL */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Image Upload</label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-white/20" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="galleryImageUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="galleryImageUpload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <hr className="flex-1 border-white/10" />
              <span className="text-xs text-white/40 uppercase tracking-widest">or</span>
              <hr className="flex-1 border-white/10" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Image URL</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    if (!imageFile) setImagePreview(e.target.value);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Caption (Optional)</label>
            <input
              type="text"
              value={formData.caption || ""}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="shop">Shop</option>
                <option value="repairs">Repairs</option>
                <option value="customers">Customers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-900 pt-4 pb-2 border-t border-white/10 flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Image"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
