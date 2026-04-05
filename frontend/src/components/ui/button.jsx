export function Button({ children, className = "", variant = "default", ...props }) {
    const base = "px-4 py-2 rounded-lg font-medium transition";
  
    const variants = {
      default: "bg-green-500 hover:bg-green-600 text-white",
      outline: "border border-gray-600 text-white hover:bg-gray-800",
    };
  
    return (
      <button className={`${base} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }