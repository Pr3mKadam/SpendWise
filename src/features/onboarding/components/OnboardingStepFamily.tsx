import React from 'react';
import { Users, User, ArrowRight, Minus, Plus } from 'lucide-react';

export type FamilyOption = 'myself' | 'family';

export type FamilyGoal = 'allowance' | 'limits' | 'learning';

interface OnboardingStepFamilyProps {
  step: number;
  familyOption: FamilyOption;
  setFamilyOption: (v: FamilyOption) => void;
  childCount: number;
  setChildCount: (v: number) => void;
  childAges: string;
  setChildAges: (v: string) => void;
  familyGoals: FamilyGoal[];
  toggleFamilyGoal: (g: FamilyGoal) => void;
  handleProceed: () => void;
}

const AGE_OPTIONS = ['5-8', '9-12', '13-15', '16-18'];

const GOAL_LIST: { id: FamilyGoal; label: string; desc: string }[] = [
  { id: 'allowance', label: 'Allowance Management', desc: 'Set recurring allowances' },
  { id: 'limits', label: 'Spending Limits', desc: 'Control how much kids can spend' },
  { id: 'learning', label: 'Financial Learning', desc: 'Teach money management skills' },
];

export function OnboardingStepFamily({
  step,
  familyOption,
  setFamilyOption,
  childCount,
  setChildCount,
  childAges,
  setChildAges,
  familyGoals,
  toggleFamilyGoal,
  handleProceed,
}: OnboardingStepFamilyProps) {
  const isFamily = familyOption === 'family';

  return (
    <div
      className="flex-1 p-6 md:p-10 transition-all duration-300"
      style={{ background: '#ffffff', display: step === 4 ? 'block' : 'none' }}
    >
      <div className="mb-7">
        <h3
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}
        >
          Who is this for?
        </h3>
        <p
          style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}
        >
          Are you setting up for yourself or your family?
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        {[
          { id: 'myself' as FamilyOption, title: 'For Myself', icon: User, desc: 'Personal tracking' },
          { id: 'family' as FamilyOption, title: 'For My Family', icon: Users, desc: 'Manage together' },
        ].map(opt => {
          const selected = familyOption === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setFamilyOption(opt.id)}
              style={{
                flex: 1,
                padding: '20px 12px',
                borderRadius: '16px',
                border: selected ? '2px solid var(--teal)' : '2px solid #edf2f7',
                background: selected ? 'var(--teal-dim)' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: selected ? 'var(--teal)' : '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={22} color={selected ? '#ffffff' : '#64748b'} />
              </div>
              <div className="text-center">
                <h4
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: selected ? 'var(--teal)' : 'var(--text-primary)',
                  }}
                >
                  {opt.title}
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}
                >
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {isFamily && (
        <div className="space-y-5 mb-6 animate-fade-in">
          <div>
            <label
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Number of Children
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChildCount(Math.max(1, childCount - 1))}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '2px solid #edf2f7',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms',
                }}
              >
                <Minus size={16} color="var(--text-secondary)" />
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--teal)',
                  minWidth: '32px',
                  textAlign: 'center',
                }}
              >
                {childCount}
              </span>
              <button
                onClick={() => setChildCount(Math.min(10, childCount + 1))}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: '2px solid #edf2f7',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms',
                }}
              >
                <Plus size={16} color="var(--text-secondary)" />
              </button>
            </div>
          </div>

          <div>
            <label
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Child Age Groups
            </label>
            <div className="flex gap-2 flex-wrap">
              {AGE_OPTIONS.map(age => {
                const selected = childAges === age;
                return (
                  <button
                    key={age}
                    onClick={() => setChildAges(selected ? '' : age)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: selected ? '2px solid var(--teal)' : '2px solid #edf2f7',
                      background: selected ? 'var(--teal-dim)' : '#f8fafc',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-inter)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: selected ? 'var(--teal)' : 'var(--text-secondary)',
                      transition: 'all 150ms',
                    }}
                  >
                    {age} yrs
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              Family Goals
            </label>
            <div className="space-y-2">
              {GOAL_LIST.map(g => {
                const selected = familyGoals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleFamilyGoal(g.id)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: selected ? '2px solid var(--teal)' : '2px solid #edf2f7',
                      background: selected ? 'var(--teal-dim)' : '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 150ms',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: selected ? '2px solid var(--teal)' : '2px solid #cbd5e1',
                        background: selected ? 'var(--teal)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 150ms',
                        flexShrink: 0,
                      }}
                    >
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontFamily: 'var(--font-inter)',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: selected ? 'var(--teal)' : 'var(--text-primary)',
                        }}
                      >
                        {g.label}
                      </h4>
                      <p
                        style={{
                          fontFamily: 'var(--font-inter)',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {g.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleProceed}
        disabled={!familyOption}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '12px',
          border: 'none',
          cursor: familyOption ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-inter)',
          fontSize: '15px',
          fontWeight: 600,
          color: '#ffffff',
          background: familyOption ? 'var(--teal)' : '#a0aec0',
          transition: 'background 200ms ease, box-shadow 200ms ease, transform 80ms',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        onMouseEnter={e => {
          if (familyOption) {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal-light)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px var(--teal-glow)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = familyOption ? 'var(--teal)' : '#a0aec0';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        {isFamily ? 'Set Up Family' : 'Continue'}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
