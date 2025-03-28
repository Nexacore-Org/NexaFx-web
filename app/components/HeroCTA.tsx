export default function HeroCTA() {
  return (
    <div className="mt-8 flex flex-row items-start gap-4">
      <button className="w-auto px-8 py-3 rounded-md text-white font-medium bg-gradient-to-r from-[#3B82F6] to-[#EAB308] hover:opacity-90 transition">
        Start Trading →
      </button>
      <button className="w-auto px-8 py-3 border rounded-md border-[#E2E8F0] text-[#0F172A] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition">
        Learn More
      </button>
    </div>
  );
}
