export default function HowItWorkSection() {
  return (
    <section className="bg-gray-50 py-24 w-full" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 text-sm font-medium text-black bg-yellow-100 rounded-md mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Secure, and Fast
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Start exchanging currencies in just a few simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex items-center">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-800">
                1
              </div>
              <div className="absolute left-[30px] mt-3 w-24 h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Create an Account</h3>
            <p className="text-gray-600">
              Sign up with your email and verify your identity to get started
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="relative flex items-center">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-yellow-100 text-2xl font-bold text-yellow-800">
                2
              </div>
              <div className="absolute left-[30px] mt-3 w-24 h-1 bg-gradient-to-r from-yellow-500 to-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Fund Your Account</h3>
            <p className="text-gray-600">
              Add funds using bank transfers, cards, or cryptocurrency
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-800">
              3
            </div>
            <h3 className="text-xl font-semibold mb-4">Exchange & Transfer</h3>
            <p className="text-gray-600">
              Convert currencies at competitive rates and transfer to your
              desired destination
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-yellow-500 text-white font-semibold rounded-md hover:opacity-90 transition-opacity">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
