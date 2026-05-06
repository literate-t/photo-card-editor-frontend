interface BasicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  text?: string;
}

export default function BasicButton({
  className,
  text,
  ...rest
}: BasicButtonProps) {
  return (
    <button
      className={`px-2 text-gray-300 font-light text-[12px] border-transparent rounded-xl shadow-sm transition duration-200 hover:ring-1 hover:ring-gray-500 disabled:bg-gray-400 ${className}`}
      {...rest}
    >
      {text}
    </button>
  );
}
