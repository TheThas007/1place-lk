import { useState, useEffect } from "react";
import { X, Upload, Loader2, Link } from "lucide-react";
import { Category } from "@/lib/types";
import { db, storage } from "@/lib/firebase";
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uploadImageWithFallback } from "@/lib/upload-utils";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Category | null;
}

export default function CategoryModal({ isOpen, onClose, onSave, initialData }: CategoryModalProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    icon: "",
    image_url: "",
    sort_order: 0,
    group: "phones",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.image_url || "");
      setIconPreview(
        initialData.icon?.startsWith("http") || initialData.icon?.startsWith("data:")
          ? initialData.icon
          : ""
      );
    } else {
      setFormData({
        name: "",
        slug: "",
        icon: "",
        image_url: "",
        sort_order: 0,
        group: "phones",
      });
      setImagePreview("");
      setIconPreview("");
    }
    setImageFile(null);
    setIconFile(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, image_url: "" });
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        alert("Icon image must be less than 1MB.");
        return;
      }
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, icon: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, name, slug: formData.slug || slug });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = formData.image_url || "";
      let finalIcon = formData.icon || "";

      if (imageFile) {
        finalImageUrl = await uploadImageWithFallback(imageFile, "categories");
      }

      if (!finalImageUrl) {
        alert("Please provide an image URL or upload a file.");
        setIsLoading(false);
        return;
      }

      const categoryData = {
        ...formData,
        image_url: finalImageUrl,
        icon: finalIcon,
      };

      if (initialData && initialData.id) {
        await updateDoc(doc(db, "categories", initialData.id), categoryData);
      } else {
        await addDoc(collection(db, "categories"), categoryData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-white/10 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">
            {initialData ? "Edit Category" : "Add Category"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Category Name</label>
              <input
                required
                type="text"
                value={formData.name || ""}
                onChange={handleNameChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Slug</label>
              <input
                required
                type="text"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Category Icon</label>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {iconPreview ? (
                    <img src={iconPreview} alt="Icon Preview" className="w-full h-full object-cover" />
                  ) : formData.icon && (formData.icon.startsWith("http") || formData.icon.startsWith("data:")) ? (
                    <img src={formData.icon} alt="Icon Preview" className="w-full h-full object-contain p-1" />
                  ) : formData.icon ? (
                    <span className="text-2xl">{formData.icon}</span>
                  ) : (
                    <ImageIcon className="w-5 h-5 text-white/20" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="categoryIconUpload"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="categoryIconUpload"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Icon
                  </label>
                </div>
              </div>
              <input
                type="text"
                placeholder="Or paste URL / Emoji (📱)"
                value={formData.icon || ""}
                onChange={(e) => {
                  setFormData({ ...formData, icon: e.target.value });
                  if (!iconFile && e.target.value.startsWith("http")) setIconPreview(e.target.value);
                  else if (!iconFile) setIconPreview("");
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Group</label>
              <select
                value={formData.group || "phones"}
                onChange={(e) => setFormData({ ...formData, group: e.target.value as any })}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="phones">Phones</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Category Image</label>
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
                    id="categoryImageUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="categoryImageUpload"
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
                  value={formData.image_url || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    if (!imageFile) setImagePreview(e.target.value);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
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
                "Save Category"
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
