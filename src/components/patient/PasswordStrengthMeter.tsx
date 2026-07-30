import React from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthMeterProps {
  pass: string
}

export default function PasswordStrengthMeter({ pass }: PasswordStrengthMeterProps) {
  const getStrengthMetrics = () => {
    let score = 0
    if (!pass) return { score: 0, text: 'No Password Entered', color: 'bg-gray-200' }

    const checks = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    }

    score = Object.values(checks).filter(Boolean).length

    let text = 'Weak'
    let color = 'bg-red-500'

    if (score === 5) {
      text = 'Excellent'
      color = 'bg-emerald-600'
    } else if (score >= 3) {
      text = 'Medium Strength'
      color = 'bg-amber-500'
    }

    return { score, text, color, checks }
  }

  const { score, text, color, checks } = getStrengthMetrics()

  return (
    <div className="space-y-3.5 pt-2">
      {/* Strength indicator bars */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <span>Password Strength</span>
          <span className="font-black text-gray-700">{text}</span>
        </div>
        <div className="grid grid-cols-5 gap-1 h-1.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-full rounded-sm transition-all duration-300 ${
                level <= score ? color : 'bg-gray-150'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirement list checklist */}
      {pass && checks && (
        <div className="space-y-1 text-[10px] font-bold text-gray-500 leading-relaxed pt-1 border-t border-gray-100">
          <div className="flex items-center space-x-1.5">
            {checks.length ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-400" />}
            <span>At least 8 characters long</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {checks.upper && checks.lower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-400" />}
            <span>Contains uppercase &amp; lowercase letters</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {checks.number ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-400" />}
            <span>Contains numbers</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {checks.special ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-red-400" />}
            <span>Contains special character (e.g. !, @, #, etc.)</span>
          </div>
        </div>
      )}
    </div>
  )
}
