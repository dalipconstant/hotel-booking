import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-terracotta-500 flex items-center justify-center">
                <span className="text-white font-serif font-bold">S</span>
              </div>
              <span className="font-serif text-xl text-white">Serenity</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              A warm boutique hotel experience where heritage meets modern comfort.
              Every stay is crafted with care.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-terracotta-400 transition">Home</Link></li>
              <li><Link to="/rooms" className="hover:text-terracotta-400 transition">Rooms & Suites</Link></li>
              <li><Link to="/login" className="hover:text-terracotta-400 transition">Guest Login</Link></li>
              <li><Link to="/signup" className="hover:text-terracotta-400 transition">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-terracotta-400 shrink-0" />
                <span>12 Heritage Lane, Jaipur, Rajasthan 302001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-terracotta-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-terracotta-400" />
                <span>sgtraders542@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Serenity Boutique Hotel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
