import { Link } from 'react-router-dom';
import { IconFileInvoice, IconCreditCard, IconChartBar, IconBolt, IconUsers, IconShieldCheck } from '@tabler/icons-react';

const HeroPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <IconFileInvoice className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">BillFlow</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</a>
            <a href="#resources" className="text-sm text-gray-600 hover:text-gray-900 transition">Resources</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">Log In</Link>
            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm mb-6">
            <IconBolt size={16} />
            <span>New v2.0 is now live</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Billing Management <br />
            <span className="text-blue-600">Made Simple</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your financial operations with automated invoicing, real-time payment tracking, and comprehensive financial reporting.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <Link to="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Get Started
            </Link>
            <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2">
              <IconChartBar size={20} />
              View Demo
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-100 rounded"></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-24 bg-gray-50 rounded"></div>
                <div className="h-24 bg-gray-50 rounded"></div>
                <div className="h-24 bg-gray-50 rounded"></div>
              </div>
              <div className="h-48 bg-gray-50 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 bg-white/50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">TRUSTED BY FAST-MOVING COMPANIES</p>
          <div className="flex items-center justify-center gap-12 opacity-40">
            <span className="text-2xl font-bold text-gray-400">Acme</span>
            <span className="text-2xl font-bold text-gray-400">Lofus</span>
            <span className="text-2xl font-bold text-gray-400">Poly</span>
            <span className="text-2xl font-bold text-gray-400">Tech</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-600 font-semibold mb-2">FEATURES</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to manage billing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Focus on growing your business while we handle the complexities of financial tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <IconBolt className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Invoicing</h3>
              <p className="text-gray-600">
                Set up recurring invoices and forget about them. We automatically email bills and reminders to your clients on your schedule.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <IconCreditCard className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Tracking</h3>
              <p className="text-gray-600">
                Track payments in real-time across multiple gateways. Know exactly who has paid and who still owes you money instantly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <IconChartBar className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Reports</h3>
              <p className="text-gray-600">
                Generate comprehensive financial reports with a single click. View revenue growth, charts, and MRR anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <IconUsers className="mx-auto text-blue-600" size={32} />
          </div>
          <blockquote className="text-2xl font-medium text-gray-900 mb-8">
            "BillFlow has completely transformed how we handle our subscription billing. The automated invoicing alone has saved us 20 hours a month."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Sarah Johnson</p>
              <p className="text-sm text-gray-600">CFO at NexTech</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-600 font-semibold mb-2">PRICING</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Plans for teams of all sizes</h2>
            <p className="text-gray-600">Simple, transparent pricing. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Starter</h3>
              <p className="text-sm text-gray-600 mb-6">Perfect for freelancers and side projects.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <IconShieldCheck size={16} className="text-green-600" />
                  <span>100 Invoices/month</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <IconShieldCheck size={16} className="text-green-600" />
                  <span>Basic Invoicing</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <IconShieldCheck size={16} className="text-green-600" />
                  <span>Email Support</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <IconShieldCheck size={16} className="text-green-600" />
                  <span>5 Automated Reminders</span>
                </li>
              </ul>
              <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                Get started for free
              </button>
            </div>

            {/* Pro */}
            <div className="bg-blue-600 p-8 rounded-xl border-2 border-blue-700 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-700 text-white text-xs rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
              <p className="text-sm text-blue-100 mb-6">For growing businesses and small teams.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-blue-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-white">
                  <IconShieldCheck size={16} />
                  <span>Unlimited Clients</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <IconShieldCheck size={16} />
                  <span>Advanced Invoicing</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <IconShieldCheck size={16} />
                  <span>Automated Reminders</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <IconShieldCheck size={16} />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <IconShieldCheck size={16} />
                  <span>Financial Reports</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                Get started today
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-sm text-gray-600 mb-6">Custom solutions for large organizations.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <IconShieldCheck size={16} className="text-green-600" />
                  <span>Unlimited Everything</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <IconShieldCheck size={16} className="text-green-600" />
                  <span>Custom Integrations</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <IconShieldCheck size={16} className="text-green-600" />
                  <span>Dedicated Account Manager</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <IconShieldCheck size={16} className="text-green-600" />
                  <span>SLA Guarantee</span>
                </li>
              </ul>
              <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <IconFileInvoice className="text-white" size={20} />
                </div>
                <span className="text-lg font-bold text-white">BillFlow</span>
              </div>
              <p className="text-sm mb-4">
                Making invoicing and payment tracking simple, automated, and easy for teams of all sizes.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition">
                  <IconUsers size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Resources</a></li>
                <li><a href="#" className="hover:text-white transition">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-sm text-center">
            <p>© 2025 BillFlow SaaS. All rights reserved. • Made with ❤️ by Lyla Payments</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroPage;