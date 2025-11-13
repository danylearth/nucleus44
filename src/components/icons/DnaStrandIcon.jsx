
export default function DnaStrandIcon({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 6.5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 17.5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6.5C8 9.81371 16 14.1863 16 17.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}