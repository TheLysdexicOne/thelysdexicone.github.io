import { getImagePath } from '@/utils/basePath';

interface StatIconProps {
  iconId:
    | 'dexterity_icon'
    | 'endurance_icon'
    | 'intelligence_icon'
    | 'leadership_icon'
    | 'speed_icon'
    | 'strength_icon';
  className?: string;
}

export default function StatIcon({
  iconId,
  className = 'h-4 w-4',
}: StatIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      style={{ imageRendering: 'pixelated' }}
    >
      <use href={`${getImagePath('/images/stats/stat_icons.svg')}#${iconId}`} />
    </svg>
  );
}
