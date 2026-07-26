import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ImagePlus, X } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import Chip from "../components/Chip";
import { categories, conditions } from "../data";
import type { Condition } from "../types/database";
import { createListing } from "../lib/listings";
import { useAuth } from "../auth/AuthContext";

export default function PostItem() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [condition, setCondition] = useState<Condition | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canPost =
    title.trim() &&
    lookingFor.trim() &&
    condition &&
    cat &&
    files.length > 0 &&
    user;

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 5);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  function removeFile(i: number) {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (!user || !condition || !cat) return;
    setBusy(true);
    setError("");
    try {
      const id = await createListing({
        ownerId: user.id,
        title,
        description: desc,
        condition,
        category: cat,
        lookingFor,
        location: profile?.city ?? "Philippines",
        files,
      });
      navigate(`/item/${id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <ScreenHeader title="Post an Item" />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 text-brand-600">
            <Camera size={22} />
            <span className="text-[11px] font-semibold">Add photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onPickFiles(e.target.files)}
            />
          </label>
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {previews.length === 0 &&
            [0, 1].map((i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-2xl bg-gray-100 text-gray-300"
              >
                <ImagePlus size={22} />
              </div>
            ))}
        </div>

        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mountain Bike"
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Describe your item, its condition and any details."
            className="input resize-none"
          />
        </Field>

        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                active={cat === c.id}
                onClick={() => setCat(c.id)}
              />
            ))}
          </div>
        </Field>

        <Field label="Condition">
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <Chip
                key={c}
                label={c}
                active={condition === c}
                onClick={() => setCondition(c)}
              />
            ))}
          </div>
        </Field>

        <Field label="What are you looking for?">
          <input
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="e.g. Laptop, Guitar or similar"
            className="input"
          />
        </Field>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button fullWidth disabled={!canPost || busy} onClick={() => void submit()}>
          {busy ? "Posting…" : "Post Item"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <label className="mb-2 block text-sm font-bold text-gray-900">{label}</label>
      {children}
    </div>
  );
}
