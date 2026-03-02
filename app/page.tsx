import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition-colors duration-200">
            NeuroLearn AI
          </Link>
          <ul className="flex space-x-6">
            <li>
              <Link href="/about" className="hover:text-gray-300 transition-colors duration-200">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-gray-300 transition-colors duration-200">
                Services
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gray-300 transition-colors duration-200">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-gray-300 transition-colors duration-200">
                Blog
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          Welcome to <span className="text-indigo-600">NeuroLearn AI</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mb-8">
          Empowering the future of learning and cognitive enhancement with cutting-edge artificial intelligence solutions.
        </p>
        <div className="flex space-x-4">
          <Link href="/services" className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 shadow-lg">
            Explore Services
          </Link>
          <Link href="/contact" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors duration-200 shadow-lg">
            Get in Touch
          </Link>
        </div>
        {/* Additional homepage content can be added here */}
      </main>

      <footer className="bg-gray-800 text-white p-6 text-center shadow-inner">
        <div className="container mx-auto">
          <p className="mb-2">&copy; {new Date().getFullYear()} NeuroLearn AI. All rights reserved.</p>
          <nav className="mt-4">
            <ul className="flex justify-center space-x-6 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-gray-300 transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-gray-300 transition-colors duration-200">
                  Sitemap
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
