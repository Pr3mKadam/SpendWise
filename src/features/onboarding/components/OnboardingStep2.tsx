import React from 'react';
import { ArrowRight } from 'lucide-react';

export type UserRole = 'student' | 'professional' | 'business';

interface OnboardingStep2Props {
  step: number;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  setStep: (step: 1 | 2 | 3) => void;
}

export function OnboardingStep2({ step, userRole, setUserRole, setStep }: OnboardingStep2Props) {
  return (
    <div
      className="flex-1 p-6 md:p-10 transition-all duration-300"
      style={{ background: '#ffffff', display: step === 2 ? 'block' : 'none' }}
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
          Choose your Persona
        </h3>
        <p
          style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}
        >
          We'll customize your tools based on your role
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {[
          { id: 'student', title: 'Student', desc: 'Habit building & learning focus', icon: '🎓' },
          {
            id: 'professional',
            title: 'Professional',
            desc: 'Net worth & goals focus',
            icon: '💼',
          },
          {
            id: 'business',
            title: 'Business Owner',
            desc: 'Cash flow & analytics focus',
            icon: '🏢',
          },
        ].map(role => {
          const isSelected = userRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setUserRole(role.id as UserRole)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: isSelected ? '2px solid var(--teal)' : '2px solid #edf2f7',
                background: isSelected ? 'var(--teal-dim)' : '#f8fafc',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span style={{ fontSize: '24px' }}>{role.icon}</span>
              <div>
                <h4
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: isSelected ? 'var(--teal)' : 'var(--text-primary)',
                  }}
                >
                  {role.title}
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {role.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setStep(3)}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter)',
          fontSize: '15px',
          fontWeight: 600,
          color: '#ffffff',
          background: 'var(--teal)',
          transition: 'background 200ms ease, box-shadow 200ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        Almost There
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
