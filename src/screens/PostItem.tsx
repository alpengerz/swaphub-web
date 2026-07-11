import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ImagePlus } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import Chip from "../components/Chip";
import { categories, conditions } from "../data";

export default function PostItem() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [condition, setCondition] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);

  const canPost = title.trim() && lookingFor.trim() && condition && cat;

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <ScreenHeader title="Post an Item" />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <button className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 text-brand-600">
            <Camera size={22} />
            <span className="text-[11px] font-semibold">Add photo</span>
          </button>
          {[0, 1].map((i) => (
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
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button fullWidth disabled={!canPost} onClick={() => navigate("/home")}>
          Post Item
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
      <label className="mb-2 block text-sm font-bold text-gray-900">
        {label}
      </label>
      {children}
    </div>
  );
}
