import Image from "next/image";
import { getModelImage } from "@/lib/modelImages";

export default function ModelImage({
  brand,
  model,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  brand: string;
  model: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const image = getModelImage(brand, model);

  if (!image) {
    return null;
  }

  return (
    <Image
      src={image.src}
      alt={alt ?? `${brand} ${model}`}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-contain ${className}`.trim()}
    />
  );
}
