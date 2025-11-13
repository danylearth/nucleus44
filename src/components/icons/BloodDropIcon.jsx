
export default function BloodDropIcon({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 21.35C9.23 18.23 6 13.9 6 10.5 6 6.36 8.69 3 12 3s6 3.36 6 7.5c0 3.4-3.23 7.73-6 10.85z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M10.5 13.5C11.33 13.5 12 12.83 12 12" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}