import { useState } from 'react';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';

export default function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:bg-purple-700 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                Tech<span className="text-purple-600">Pulse</span>
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a 
                href="#" 
                className="hover:text-slate-900 transition-colors"
              >
                Home
              </a>
              
              <div className="relative group flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors py-2">
                <span>Products</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>

              <div className="relative group flex items-center gap-1 cursor-pointer text-purple-600 font-semibold py-2">
                <span>Resources</span>
                <ChevronDown className="w-4 h-4 text-purple-600 transition-colors" />
              </div>

              <a 
                href="#" 
                className="hover:text-slate-900 transition-colors"
              >
                Pricing
              </a>
            </div>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors"
            >
              Log in
            </a>
            <a
              href="#"
              className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg shadow-sm shadow-purple-200 transition-all"
            >
              Make a post
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <a
            href="#"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            Home
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            Products
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg text-base font-medium text-purple-600 bg-purple-50 font-semibold"
          >
            Resources
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            Pricing
          </a>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="#"
              className="w-full text-center py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Log in
            </a>
            <a
              href="#"
              className="w-full text-center py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-sm transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}