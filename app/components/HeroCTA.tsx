export default function HeroCTA() {
  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
      <button className="px-6 py-3 rounded-full text-white font-medium bg-gradient-to-r from-[#3B82F6] to-[#EAB308] hover:opacity-90 transition">
        Start Trading
      </button>
      <button className="px-6 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] hover:bg-gray-100 transition">
        Learn More
      </button>
    </div>
  );
}
