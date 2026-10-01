import type { ButtonHTMLAttributes } from 'react'
type V = 'primary' | 'outline' | 'green' | 'white'
export const btnClass = (v: V = 'primary', sm = false) =>
  `inline-flex items-center justify-center gap-2 rounded font-bold border-[1.5px] transition active:scale-[.98] disabled:opacity-60 ${sm ? 'px-3 py-1.5 text-sm' : 'px-5 py-2.5'} ` +
  { primary: 'bg-navy border-navy text-white hover:bg-[#0d2c4a]', outline: 'bg-transparent border-navy text-navy hover:bg-navy/5',
    green: 'bg-grn border-grn text-white hover:bg-deep', white: 'bg-white border-white text-navy hover:bg-paper' }[v]
export default function Button({ variant, sm, className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V; sm?: boolean }) {
  return <button {...p} className={`${btnClass(variant, sm)} ${className}`} />
}
