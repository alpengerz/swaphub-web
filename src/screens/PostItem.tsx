import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, ImagePlus, X } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import Chip from "../components/Chip";
import { categories, conditions, normalizeCategoryId } from "../data";
import type { Condition, ListingPhoto } from "../types/database";
import {
  LOOKING_FOR_PRESETS,
  OPEN_TO_OFFERS,
  createListing,
  fetchListing,
  photoUrls,
  updateListing,
} from "../lib/listings";
import { useAuth } from "../auth/AuthContext";

type ExistingPhoto = {
  id: string;
  url: string;
};

export default function PostItem() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = Boolean(editId);
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [condition, setCondition] = useState<Condition | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editId || !user) return;
    let cancelled = false;
    setLoadingEdit(true);
    fetchListing(editId)
      .then((listing) => {
        if (cancelled) return;
        if (!listing || listing.owner_id !== user.id) {
          setError("You can only edit your own listings.");
          return;
        }
        setTitle(listing.title);
        setDesc(listing.description ?? "");
        setLookingFor(listing.looking_for ?? "");
        setCondition(listing.condition);
        setCat(normalizeCategoryId(listing.category) ?? listing.category);
        const photos = [...(listing.listing_photos ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order
        ) as ListingPhoto[];
        const urls = photoUrls(listing);
        setExistingPhotos(
          photos.map((p, i) => ({ id: p.id, url: urls[i] ?? "" }))
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load listing");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingEdit(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editId, user]);

  const photoCount = existingPhotos.length + files.length;
  const canPost =
    title.trim() &&
    lookingFor.trim() &&
    condition &&
    cat &&
    photoCount > 0 &&
    user &&
    !loadingEdit;

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const room = Math.max(0, 5 - existingPhotos.length - files.length);
    if (room === 0) return;
    const next = [...files, ...Array.from(list)].slice(0, files.length + room);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  function removeNewFile(i: number) {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  function removeExisting(id: string) {
    setExistingPhotos((rows) => rows.filter((p) => p.id !== id));
  }

  async function submit() {
    if (!user || !condition || !cat) return;
    setBusy(true);
    setError("");
    try {
      if (isEdit && editId) {
        await updateListing({
          listingId: editId,
          ownerId: user.id,
          title,
          description: desc,
          condition,
          category: cat,
          lookingFor,
          location: profile?.city ?? "Philippines",
          keepPhotoIds: existingPhotos.map((p) => p.id),
          newFiles: files,
        });
        navigate(`/item/${editId}`, { replace: true });
      } else {
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
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Could not save changes."
            : "Could not post item."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <ScreenHeader title={isEdit ? "Edit listing" : "Post an Item"} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {loadingEdit ? (
          <p className="text-sm text-gray-500">Loading listing…</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {photoCount < 5 && (
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
              )}
              {existingPhotos.map((p) => (
                <div
                  key={p.id}
                  className="relative aspect-square overflow-hidden rounded-2xl"
                >
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(p.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {previews.map((src, i) => (
                <div
                  key={`new-${i}`}
                  className="relative aspect-square overflow-hidden rounded-2xl"
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photoCount === 0 &&
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
                {categories.map((c) => (
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
              <p className="mb-2 text-xs text-gray-500">
                Pick a quick option, or type a specific item you want in return.
              </p>
              <div className="mb-2 flex flex-wrap gap-2">
                {LOOKING_FOR_PRESETS.map((preset) => (
                  <Chip
                    key={preset}
                    label={preset === OPEN_TO_OFFERS ? "Open to offers" : preset}
                    active={lookingFor.trim().toLowerCase() === preset.toLowerCase()}
                    onClick={() => setLookingFor(preset)}
                  />
                ))}
              </div>
              <input
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder="e.g. Laptop, Guitar — or choose Open to offers"
                className="input"
              />
            </Field>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button fullWidth disabled={!canPost || busy} onClick={() => void submit()}>
          {busy
            ? isEdit
              ? "Saving…"
              : "Posting…"
            : isEdit
              ? "Save changes"
              : "Post Item"}
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
