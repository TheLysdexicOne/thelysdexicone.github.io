'use client';

import { useProgressData } from '@/hooks/useProgressData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDungeon } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { activeSlot, switchSaveSlot, getAllSaveSlots, deleteSaveSlot } =
    useProgressData();

  const saveSlots = getAllSaveSlots();

  const handleSlotClick = (slot: number) => {
    if (slot !== activeSlot) {
      switchSaveSlot(slot);
    }
  };

  const handleDeleteSlot = (slot: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      confirm(
        `Are you sure you want to delete ${saveSlots.find(s => s.slot === slot)?.data.name || `Save ${slot}`}? This cannot be undone.`
      )
    ) {
      deleteSaveSlot(slot);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 rounded-lg border-4 border-primary bg-body p-6 shadow-2xl sm:p-8">
        {/* Title */}
        <div className="card-primary-header -mx-6 -mt-6 sm:-mx-8 sm:-mt-8">
          <h1 className="mb-4 text-center font-pixel text-3xl font-bold uppercase tracking-widest text-primary sm:text-4xl">
            Settings
          </h1>
        </div>

        {/* Save Slots Section */}
        <div className="mb-8">
          <h2 className="mb-4 font-pixel text-xl font-semibold uppercase tracking-widest text-primary sm:text-2xl">
            Save Slots
          </h2>
          <div className="space-y-3">
            {saveSlots.map(({ slot, data }) => (
              <div
                key={slot}
                onClick={() => handleSlotClick(slot)}
                className={`relative cursor-pointer rounded-lg border-2 border-primary p-4 transition-all ${
                  slot === activeSlot
                    ? 'btn-body-primary border-btn-dark bg-btn-primary-highlight/30 text-left'
                    : 'btn-body-primary hover:bg-btn-primary-hover text-left'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-pixel text-lg font-bold uppercase tracking-widest text-primary sm:text-xl">
                        {data.name || `Save ${slot}`}
                      </span>
                      {slot === activeSlot && (
                        <span className="bg-nav_btn_active rounded px-2 py-1 font-pixel text-xs font-bold uppercase tracking-wider text-primary">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-pixel text-xs uppercase tracking-wider text-secondary sm:text-sm">
                      Last modified: {formatDate(data.lastModified)}
                    </div>
                    <div className="mt-1 font-pixel text-xs uppercase tracking-wider text-secondary">
                      {data.lastDifficulty} • Tier {data.lastTier}
                    </div>
                  </div>
                  <button
                    onClick={e => handleDeleteSlot(slot, e)}
                    className="ml-4 rounded bg-red-700 px-3 py-1 font-pixel text-sm font-bold uppercase tracking-wider text-primary transition-colors hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links Section */}
        <div>
          <h2 className="mb-4 font-pixel text-xl font-semibold uppercase tracking-widest text-primary sm:text-2xl">
            Quick Links
          </h2>
          <button
            onClick={() => router.push('/settings/reorder-heroes')}
            className="btn-body-primary flex w-full items-center gap-4"
          >
            <FontAwesomeIcon
              icon={faDungeon}
              className="text-2xl text-primary"
            />
            <span className="font-pixel text-lg font-bold uppercase tracking-widest text-primary sm:text-xl">
              Reorder Characters
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
