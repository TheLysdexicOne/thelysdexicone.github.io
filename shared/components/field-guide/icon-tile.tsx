/**
 * Shared icon tile component with fallback placeholder.
 *
 * Renders an icon image if available, otherwise displays a colored placeholder
 * with a text label. Used for category icons, item icons, etc.
 */

type IconTileProps = {
  /** Path to the icon image (relative or absolute URL). */
  iconPath?: string;
  /** Alt text for the icon image. */
  alt: string;
  /** Text label to display in the placeholder if no icon exists. */
  placeholderLabel?: string;
  /** Optional CSS classes for sizing and styling. */
  className?: string;
};

export default function IconTile({
  iconPath,
  alt,
  placeholderLabel,
  className = "h-8 w-8",
}: IconTileProps) {
  if (iconPath) {
    return (
      <img
        src={iconPath}
        alt={alt}
        className={`object-contain ${className}`}
        loading="lazy"
      />
    );
  }

  // Fallback placeholder
  return (
    <div
      className={`flex items-center justify-center rounded bg-main ${className}`}
      title={alt}
    >
      {placeholderLabel && (
        <span className="text-[8px] font-bold uppercase leading-none text-secondary opacity-40">
          {placeholderLabel.slice(0, 3)}
        </span>
      )}
    </div>
  );
}
