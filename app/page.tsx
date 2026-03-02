import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header (simplified for the fix, assuming existing structure) */}
      <header className="w-full bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          {/* Assuming a logo exists at /logo.svg or similar */}
          <Image src="/logo.svg" alt="NeuroLearn AI Logo" width={40} height={40} className="mr-2" />
          <span className="text-2xl font-bold text-blue-600">NeuroLearn AI</span>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
        </nav>
        <div className="hidden md:flex space-x-4">
          <Link href="/signin" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">Sign In</Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Sign Up</Link>
        </div>
        {/* Mobile menu button/icon would typically go here */}
      </header>

      {/* Hero Section - This is the primary focus for the H1 fix */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 px-4 sm:py-32 lg:py-40 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* FIX: Changed h2 to h1 and adjusted styling for prominence */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white mb-6">
            Unlock Your Potential with AI-Powered Learning
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Personalized learning paths, real-time feedback, and adaptive content to help you master any subject.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/start-learning" passHref>
              <button className="px-8 py-4 bg-blue-600 text-white rounded-full text-lg sm:text-xl font-semibold shadow-lg hover:bg-blue-700 transition-colors duration-300 ease-in-out">
                Start Learning Today
              </button>
            </Link>
            <Link href="/features" passHref>
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-full text-lg sm:text-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300 ease-in-out">
                Learn More
              </button>
            </Link>
          </div>
        </div>
        {/* Optional: Add some background elements or images here to match the site's aesthetic */}
      </section>

      {/* Placeholder for other sections (assuming they exist on the live site) */}
      <section id="features" className="py-16 px-4 bg-white dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        {/* ... existing feature cards/content ... */}
      </section>

      <section id="how-it-works" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        {/* ... existing steps/content ... */}
      </section>

      <section id="testimonials" className="py-16 px-4 bg-white dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        {/* ... existing testimonials ... */}
      </section>

      <section id="pricing" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-12">Flexible Pricing Plans</h2>
        {/* ... existing pricing cards ... */}
      </section>

      <section id="faq" className="py-16 px-4 bg-white dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        {/* ... existing FAQ items ... */}
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
        <p className="text-xl mb-10 max-w-2xl mx-auto">Join NeuroLearn AI today and unlock a smarter way to learn.</p>
        <Link href="/signup" passHref>
          <button className="px-10 py-5 bg-white text-blue-600 rounded-full text-xl font-semibold shadow-lg hover:bg-gray-100 transition-colors duration-300 ease-in-out">
            Get Started Free
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-gray-300 py-8 px-6 text-center">
        <p>&copy; {new Date().getFullYear()} NeuroLearn AI. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <Link href="/privacy" className="hover:text-blue-400">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-blue-400">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
