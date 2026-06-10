import { Landmark, Zap, ShieldAlert } from 'lucide-react';
import EntryCard from '@/features/portfolio/components/EntryCard';
import { getAssetCfg, getLiabilityCfg } from '@/data/portfolioConfig';

function fmt(n: number, currency: string) {
  return `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

interface PortfolioListsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  liabilities: any[];
  totalLiabilities: number;
  currency: string;
  deleteAsset: (id: string) => void;
  deleteLiability: (id: string) => void;
  setModal: (modal: 'asset' | 'liability' | null) => void;
}

export function PortfolioLists({
  assets,
  liabilities,
  totalLiabilities,
  currency,
  deleteAsset,
  deleteLiability,
  setModal,
}: PortfolioListsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="card px-6 py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="font-manrope font-bold text-[17px]"
              style={{ color: 'var(--text-primary)' }}
            >
              Traditional Assets
            </h3>
            <p className="font-inter text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Liquid & Fixed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-manrope font-bold text-[16px]" style={{ color: 'var(--teal)' }}>
              {fmt(
                assets.filter(a => a.type !== 'crypto').reduce((s, a) => s + a.balance, 0),
                currency
              )}
            </span>
          </div>
        </div>

        {assets.filter(a => a.type !== 'crypto').length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-2xl"
            style={{ background: 'var(--surface-input)' }}
          >
            <span className="text-3xl mb-2">🏦</span>
            <p
              className="font-inter font-semibold text-[13px]"
              style={{ color: 'var(--text-muted)' }}
            >
              No traditional assets yet
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {assets
              .filter(a => a.type !== 'crypto')
              .map(asset => {
                const cfg = getAssetCfg(asset.type);
                return (
                  <EntryCard
                    key={asset.id}
                    label={asset.name}
                    icon={<Landmark size={18} />}
                    iconEmoji={asset.icon ?? cfg.icon}
                    color={asset.color ?? cfg.color}
                    balance={asset.balance}
                    currency={currency}
                    type={asset.type}
                    onDelete={() => deleteAsset(asset.id)}
                  />
                );
              })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Zap size={16} />
              </div>
              <div>
                <h3
                  className="font-manrope font-bold text-[15px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Crypto Portfolio
                </h3>
                <p
                  className="font-inter text-[length:var(--fs-caption)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Web3 Assets
                </p>
              </div>
            </div>
            <span className="font-manrope font-bold text-[15px] text-orange-500">
              {fmt(
                assets.filter(a => a.type === 'crypto').reduce((s, a) => s + a.balance, 0),
                currency
              )}
            </span>
          </div>

          {assets.filter(a => a.type === 'crypto').length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 rounded-2xl border border-dashed border-[var(--border)]">
              <span className="text-2xl mb-1">🪙</span>
              <p
                className="font-inter font-semibold text-[12px]"
                style={{ color: 'var(--text-muted)' }}
              >
                No crypto assets tracked.
              </p>
              <button
                onClick={() => setModal('asset')}
                className="mt-2 text-[length:var(--fs-caption)] font-bold text-[var(--teal)] bg-transparent border-none cursor-pointer hover:underline"
              >
                Add Crypto Asset
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {assets
                .filter(a => a.type === 'crypto')
                .map(asset => {
                  const cfg = getAssetCfg(asset.type);
                  return (
                    <EntryCard
                      key={asset.id}
                      label={asset.name}
                      icon={<Zap size={18} />}
                      iconEmoji={asset.icon ?? cfg.icon}
                      color={asset.color ?? cfg.color}
                      balance={asset.balance}
                      currency={currency}
                      type={asset.type}
                      onDelete={() => deleteAsset(asset.id)}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <div className="card px-6 py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="font-manrope font-bold text-[17px]"
              style={{ color: 'var(--text-primary)' }}
            >
              Liabilities
            </h3>
            <p className="font-inter text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Active Debts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-manrope font-bold text-[16px]" style={{ color: 'var(--red)' }}>
              {fmt(totalLiabilities, currency)}
            </span>
          </div>
        </div>

        {liabilities.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-2xl"
            style={{ background: 'var(--surface-input)' }}
          >
            <span className="text-3xl mb-2">🎉</span>
            <p className="font-inter font-semibold text-[13px]" style={{ color: 'var(--teal)' }}>
              Debt free!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {liabilities.map(liability => {
              const cfg = getLiabilityCfg(liability.type);
              return (
                <EntryCard
                  key={liability.id}
                  label={liability.name}
                  icon={<ShieldAlert size={18} />}
                  iconEmoji={liability.icon ?? cfg.icon}
                  color={cfg.color}
                  balance={liability.balance}
                  currency={currency}
                  onDelete={() => deleteLiability(liability.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
