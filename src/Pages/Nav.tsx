import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import NexTakeLogo from '../components/NexTakeLogo';

export default function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#071A2B] text-white border-b border-[#0f2c45]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 group">
              <NexTakeLogo size="md" />
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a 
                href="#" 
                className="hover:text-[#7FFFD4] transition-colors"
              >
                Home
              </a>
              
              <div className="relative group flex items-center gap-1 cursor-pointer hover:text-[#7FFFD4] transition-colors py-2">
                <span>Products</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#7FFFD4] transition-colors" />
              </div>

              <div className="relative group flex items-center gap-1 cursor-pointer text-[#7FFFD4] font-semibold py-2">
                <span>Resources</span>
                <ChevronDown className="w-4 h-4 text-[#7FFFD4] transition-colors" />
              </div>

              <a 
                href="#" 
                className="hover:text-[#7FFFD4] transition-colors"
              >
                Pricing
              </a>
            </div>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Log in
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-[#071A2B] bg-[#7FFFD4] hover:bg-[#68f0c5] px-4 py-2 rounded-lg shadow-sm transition-all"
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
        <div className="md:hidden border-t border-[#0f2c45] bg-[#071A2B] px-4 pt-3 pb-6 space-y-2 shadow-lg text-white">
          <a
            href="#"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5 hover:text-white"
          >
            Home
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5 hover:text-white"
          >
            Products
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#7FFFD4] bg-[#7FFFD4]/10 font-semibold"
          >
            Resources
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5 hover:text-white"
          >
            Pricing
          </a>

          <div className="pt-4 border-t border-[#0f2c45] flex flex-col gap-2">
            <a
              href="#"
              className="w-full text-center py-2.5 text-sm font-medium text-slate-200 border border-slate-700 rounded-lg hover:bg-white/5 transition-colors"
            >
              Log in
            </a>
            <a
              href="#"
              className="w-full text-center py-2.5 text-sm font-semibold text-[#071A2B] bg-[#7FFFD4] rounded-lg hover:bg-[#68f0c5] shadow-sm transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}