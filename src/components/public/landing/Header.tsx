"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, MessageSquare, Users, Menu, X, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";

type DropdownItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
};

const MobileAccordionItem: React.FC<{
  item: DropdownItem;
  submenuItems?: DropdownItem[];
  closeMobileMenu: () => void;
}> = ({ item, submenuItems, closeMobileMenu }) => {
  const [isSubmenuOpen, setSubmenuOpen] = useState(false);

  if (submenuItems) {
    return (
      <div className="py-2">
        <button
          onClick={() => setSubmenuOpen(!isSubmenuOpen)}
          className="flex justify-between items-center w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {item.icon}
            <span>{item.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isSubmenuOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isSubmenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-6 mt-2 border-l-2 border-gray-200 ml-2 overflow-hidden"
            >
              {submenuItems.map((subItem, index) => (
                <Link
                  key={index}
                  href={subItem.href}
                  className="flex items-center space-x-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <span>{subItem.name}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className="flex items-center space-x-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
      onClick={closeMobileMenu}
    >
      {item.icon}
      <span>{item.name}</span>
    </Link>
  );
};

const MobileMenuCategory: React.FC<{
    title: string;
    items: DropdownItem[];
    submenu?: Record<string, DropdownItem[]>;
    closeMobileMenu: () => void;
}> = ({title, items, submenu, closeMobileMenu}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="py-2 border-b border-gray-100">
            <button onClick={() => setIsOpen(!isOpen)} className="flex justify-between w-full items-center font-semibold text-lg py-2">
                <span>{title}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 overflow-hidden"
                    >
                        {items.map((item, index) => (
                            <MobileAccordionItem
                                key={index}
                                item={item}
                                submenuItems={submenu?.[item.name]}
                                closeMobileMenu={closeMobileMenu}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

type DropdownProps = {
  title: string;
  items: DropdownItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  hasIcons?: boolean;
  submenu?: Record<string, DropdownItem[]>;
};

const servicesSubmenus = {
  "Customer Support": [
    { name: "General Support", href: "/customer-support/general" },
    {
      name: "Call Center Support",
      href: "/customer-support/call-center",
    },
    {
      name: "Technical Support",
      href: "/customer-support/technical",
    },
    {
      name: "Live Chat Support",
      href: "/customer-support/live-chat",
    },
    { name: "Email Support", href: "/customer-support/email" },
    { name: "AI Call Agents", href: "/customer-support/ai-call-agents" },
  ],
};

const Dropdown = ({
  title,
  items,
  isOpen,
  onOpen,
  onClose,
  hasIcons = false,
  submenu,
}: DropdownProps) => {
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={() => {
        onClose();
        setSubmenuOpen(null);
      }}
    >
      <button
        className={`flex items-center space-x-1 cursor-pointer hover:text-blue-600 transition-colors font-medium ${
          isOpen ? "text-blue-600" : ""
        }`}
        tabIndex={0}
        onFocus={onOpen}
        onBlur={onClose}
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className={`absolute top-full left-0 mt-2 ${items.length > 6 ? 'w-[480px]' : 'w-64'} bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-30`}
          >
            <div className={`${items.length > 6 ? 'grid grid-cols-2 gap-x-2' : 'flex flex-col'}`}>
              {items.map(
                (
                  item: { name: string; href?: string; icon?: React.ReactNode },
                  i: number
                ) => (
                  <div
                    key={i}
                    className="relative group"
                    onMouseEnter={() => submenu && setSubmenuOpen(item.name)}
                    onMouseLeave={() => submenu && setSubmenuOpen(null)}
                  >
                    <Link
                      href={item.href || "#"}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors group"
                    >
                      {hasIcons && item.icon}
                      <span className="group-hover:text-blue-600 transition-colors whitespace-nowrap">
                        {item.name}
                      </span>
                      {submenu && submenu[item.name] && (
                        <ChevronDown className="w-4 h-4 ml-auto rotate-[-90deg] text-gray-400" />
                      )}
                    </Link>
                    {submenu && submenu[item.name] && (
                      <AnimatePresence>
                        {submenuOpen === item.name && (
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.18 }}
                            className="absolute top-0 left-full ml-2 w-60 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-40"
                          >
                            {submenu[item.name].map(
                              (
                                sub: {
                                  name: string;
                                  href: string;
                                  icon?: React.ReactNode;
                                },
                                j: number
                              ) => (
                                <Link
                                  key={j}
                                  href={sub.href}
                                  className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                                >
                                  {sub.name}
                                </Link>
                              )
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  const servicesDropdown = [
    {
      name: "Customer Support",
      icon: <Users className="w-5 h-5 text-blue-500" />,
      href: "/customer-support",
    },
    {
      name: "AI",
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      href: "/ai",
    },
    {
      name: "AI Call Agents",
      icon: <PhoneCall className="w-5 h-5 text-indigo-500" />,
      href: "/customer-support/ai-call-agents",
    },
    {
      name: "Tech",
      icon: <Users className="w-5 h-5 text-blue-500" />,
      href: "/tech",
    },
    {
      name: "Digital Marketing",
      icon: <Users className="w-5 h-5 text-blue-500" />,
      href: "/digital-marketing",
    },
    {
      name: "RCS",
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
      href: "/rcs",
    },
  ];

  const industriesDropdown = [
    { name: "Healthcare & Clinics", href: "/industries/healthcare" },
    { name: "Hotels & Hospitality", href: "/industries/hotels" },
    { name: "Restaurants & Food", href: "/industries/restaurants" },
    { name: "Real Estate", href: "/industries/real-estate" },
    { name: "E-commerce", href: "/industries/ecommerce" },
    { name: "Law Firms", href: "/industries/law-firms" },
    { name: "Banking & Finance", href: "/industries/banking" },
    { name: "Education", href: "/industries/education" },
    { name: "Automotive", href: "/industries/automotive" },
    { name: "Travel & Tourism", href: "/industries/travel" },
    { name: "Recruitment & HR", href: "/industries/recruitment" },
    { name: "Home Services", href: "/industries/home-services" },
    { name: "Retail Stores", href: "/industries/retail" },
    { name: "Fitness & Gyms", href: "/industries/fitness" },
    { name: "Property Management", href: "/industries/property-management" },
    { name: "SaaS & Tech", href: "/industries/saas" },
    { name: "Telecom", href: "/industries/telecom" },
  ];

  const aboutDropdown = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-navy-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 font-heading">
              B360
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center space-x-8"
            ref={dropdownRef}
          >
            <Dropdown
              title="Services"
              items={servicesDropdown}
              isOpen={activeDropdown === "services"}
              onOpen={() => setActiveDropdown("services")}
              onClose={() => setActiveDropdown(null)}
              hasIcons
              submenu={servicesSubmenus}
            />

            <Dropdown
              title="Industries"
              items={industriesDropdown}
              isOpen={activeDropdown === "industries"}
              onOpen={() => setActiveDropdown("industries")}
              onClose={() => setActiveDropdown(null)}
            />

            <Link
              href="/pricing"
              className="hover:text-blue-600 transition-colors font-medium"
            >
              Pricing
            </Link>

            <Dropdown
              title="About"
              items={aboutDropdown}
              isOpen={activeDropdown === "about"}
              onOpen={() => setActiveDropdown("about")}
              onClose={() => setActiveDropdown(null)}
            />
          </nav>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Authentication Section */}
              {status === "loading" ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              ) : session ? (
                // Authenticated User - Show Dashboard Button
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 py-2 font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                // Not Authenticated - Show Sign In Button
                <Button
                  onClick={() => signIn()}
                  variant="outline"
                  className="rounded-full px-6 py-2 font-medium"
                >
                  Sign In
                </Button>
              )}

              {/* Book a Demo Button - Always Visible */}
              <Link href="/contact">
                <Button className="bg-gradient-navy-blue text-white hover:opacity-90 rounded-full px-8 py-2 font-bold shadow-lg">
                  Book a Demo Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white z-40"
          >
            <div className="h-full overflow-y-auto">
              <div className="container mx-auto px-4 py-4">
                <MobileMenuCategory
                  title="Services"
                  items={servicesDropdown}
                  submenu={servicesSubmenus}
                  closeMobileMenu={() => setMobileMenuOpen(false)}
                />
                <MobileMenuCategory
                  title="Industries"
                  items={industriesDropdown}
                  closeMobileMenu={() => setMobileMenuOpen(false)}
                />
                <div className="py-2 border-b border-gray-100">
                  <Link
                    href="/pricing"
                    className="block font-semibold text-lg py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                </div>
                <MobileMenuCategory
                  title="About"
                  items={aboutDropdown}
                  closeMobileMenu={() => setMobileMenuOpen(false)}
                />

                {/* Mobile Authentication */}
                <div className="pt-6 mt-4 border-t border-gray-200 space-y-3">
                  {status === "loading" ? (
                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
                  ) : session ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full rounded-full py-2 font-medium"
                      >
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => {
                        signIn();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full rounded-full py-2 font-medium"
                    >
                      Sign In
                    </Button>
                  )}

                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-gradient-navy-blue text-white hover:opacity-90 rounded-full py-2 font-bold shadow-lg">
                      Book a Demo Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
