import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UserRole } from './OnboardingStep2';

interface OnboardingStep3Props {
  step: number;
  name: string;
  setName: (v: string) => void;
  userRole: UserRole;
  occupation: string;
  setOccupation: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  monthlyGoal: string;
  setMonthlyGoal: (v: string) => void;
  handleFinalSubmit: () => void;
}

export function OnboardingStep3({
  step,
  name,
  setName,
  userRole,
  occupation,
  setOccupation,
  location,
  setLocation,
  monthlyGoal,
  setMonthlyGoal,
  handleFinalSubmit,
}: OnboardingStep3Props) {
  return (
    <div
      className="flex-1 p-6 md:p-10 transition-all duration-300"
      style={{ background: '#ffffff', display: step === 3 ? 'block' : 'none' }}
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
          Finalize Profile
        </h3>
        <p
          style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}
        >
          All fields are required to secure your account
        </p>
      </div>

      <div className="space-y-4 mb-8">
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
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
            style={{
              background: '#f8fafc',
              border: '2px solid #edf2f7',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-inter)',
            }}
            onFocus={e => {
              e.target.style.border = '2px solid var(--teal)';
              e.target.style.background = '#ffffff';
            }}
            onBlur={e => {
              e.target.style.border = '2px solid #edf2f7';
              e.target.style.background = '#f8fafc';
            }}
          />
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
            Occupation
          </label>
          <input
            type="text"
            placeholder={
              userRole === 'student' ? 'e.g. University Student' : 'e.g. Software Engineer'
            }
            value={occupation}
            onChange={e => setOccupation(e.target.value)}
            className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
            style={{
              background: '#f8fafc',
              border: '2px solid #edf2f7',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-inter)',
            }}
            onFocus={e => {
              e.target.style.border = '2px solid var(--teal)';
              e.target.style.background = '#ffffff';
            }}
            onBlur={e => {
              e.target.style.border = '2px solid #edf2f7';
              e.target.style.background = '#f8fafc';
            }}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
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
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. London"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
              style={{
                background: '#f8fafc',
                border: '2px solid #edf2f7',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-inter)',
              }}
              onFocus={e => {
                e.target.style.border = '2px solid var(--teal)';
                e.target.style.background = '#ffffff';
              }}
              onBlur={e => {
                e.target.style.border = '2px solid #edf2f7';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>

          <div className="flex-1">
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
              Target Monthly Income
            </label>
            <input
              type="number"
              placeholder="5000"
              value={monthlyGoal}
              onChange={e => setMonthlyGoal(e.target.value)}
              className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
              style={{
                background: '#f8fafc',
                border: '2px solid #edf2f7',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-inter)',
              }}
              onFocus={e => {
                e.target.style.border = '2px solid var(--teal)';
                e.target.style.background = '#ffffff';
              }}
              onBlur={e => {
                e.target.style.border = '2px solid #edf2f7';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleFinalSubmit}
        disabled={!name || !occupation || !location || !monthlyGoal}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '12px',
          border: 'none',
          cursor: name && occupation && location && monthlyGoal ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-inter)',
          fontSize: '15px',
          fontWeight: 600,
          color: '#ffffff',
          background: name && occupation && location && monthlyGoal ? 'var(--teal)' : '#a0aec0',
          transition: 'all 200ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal-light)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px var(--teal-glow)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
      >
        Go to Dashboard
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
