import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-2xl font-bold font-heading text-white">B360</span>
            </div>
            <p className="text-gray-400">
              Expert customer support coverage with strategic hubs across four continents.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4 font-heading text-white">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/customer-support/general"
                  className="hover:text-white transition-colors"
                >
                  General Support
                </Link>
              </li>
              <li>
                <Link
                  href="/customer-support/technical"
                  className="hover:text-white transition-colors"
                >
                  Technical Support
                </Link>
              </li>
              <li>
                <Link
                  href="/customer-support/call-center"
                  className="hover:text-white transition-colors"
                >
                  Call Center
                </Link>
              </li>
              <li>
                <Link
                  href="/customer-support/live-chat"
                  className="hover:text-white transition-colors"
                >
                  Live Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 font-heading text-white">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 font-heading text-white">Contact</h4>
            <div className="text-gray-400">
              <p className="mb-2">
                <a href="tel:+12269930886" className="hover:text-white transition-colors">
                  +1 (226) 993-0886
                </a>
              </p>
              <p className="mb-4">
                <a href="mailto:bridgely360official@gmail.com" className="hover:text-white transition-colors">
                  bridgely360official@gmail.com
                </a>
              </p>
              <p>
                <Link
                  href="/contact"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  Get in Touch →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} B360. All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
