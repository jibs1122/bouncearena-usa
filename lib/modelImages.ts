import manifest from "@/lib/model-images.generated.json";

type ModelImageManifestEntry = {
  src: string;
  sourceFile: string;
};

const MODEL_IMAGE_MANIFEST = manifest as Record<string, ModelImageManifestEntry>;

function brandSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function modelSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getModelImageId(brand: string, model: string): string {
  return `${brandSlug(brand)}-${modelSlug(model)}`;
}

export function getModelImage(brand: string, model: string): ModelImageManifestEntry | null {
  return MODEL_IMAGE_MANIFEST[getModelImageId(brand, model)] ?? null;
}

export function hasModelImage(brand: string, model: string): boolean {
  return getModelImage(brand, model) !== null;
}
