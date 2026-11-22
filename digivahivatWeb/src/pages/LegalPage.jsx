/**
 * src/pages/LegalPage.jsx
 * Public Legal & Support Pages: Privacy Policy, Terms, Support
 */
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  LifeBuoy,
  Building2,
  Mail,
  Phone,
  Send,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const LegalPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const { showSuccess } = useToast();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isPrivacy = path.includes('privacy');
  const isTerms = path.includes('terms');
  const isSupport = path.includes('support') || (!isPrivacy && !isTerms);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showSuccess('Your support ticket has been logged. Our team will contact you shortly.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00AFEF] to-[#3E4095] flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Digi<span className="text-[#00AFEF]">Vahivat</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              to="/privacy"
              className={`px-3 py-1.5 rounded-lg transition ${
                isPrivacy ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className={`px-3 py-1.5 rounded-lg transition ${
                isTerms ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terms of Service
            </Link>
            <Link
              to="/support"
              className={`px-3 py-1.5 rounded-lg transition ${
                isSupport ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Support & Help
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {isPrivacy && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#00AFEF] flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Privacy Policy</h1>
                <p className="text-xs text-slate-500">Last updated: November 2026</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <h3 className="text-base font-bold text-slate-900">1. Information We Collect</h3>
              <p>
                DigiVahivat collects resident mobile numbers, names, flat or house
                numbers, visitor logs, payment transaction records, and emergency alerts
                to provide society management features.
              </p>

              <h3 className="text-base font-bold text-slate-900">2. Financial Data & Receipts</h3>
              <p>
                We do not store complete banking or debit card numbers on our servers.
                Receipts generated on DigiVahivat are cryptographic logs for internal
                society auditing.
              </p>

              <h3 className="text-base font-bold text-slate-900">3. Emergency SOS Location & Audio</h3>
              <p>
                When an SOS trigger is activated, emergency broadcast records are
                immediately shared with the designated gate security console and
                society committee members to facilitate rapid response.
              </p>

              <h3 className="text-base font-bold text-slate-900">4. Contact & Inquiries</h3>
              <p>
                If you have questions about your personal data privacy, please contact
                your society committee admin or support@digivahivat.in.
              </p>
            </div>
          </div>
        )}

        {isTerms && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3E4095] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Terms of Service</h1>
                <p className="text-xs text-slate-500">Governing Society ERP Usage</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <h3 className="text-base font-bold text-slate-900">1. User Accounts & Responsibilities</h3>
              <p>
                Residents and Admins agree to provide accurate flat details and phone
                numbers. Misuse of the Emergency SOS feature for pranks or non-crises
                may lead to account suspension by the society committee.
              </p>

              <h3 className="text-base font-bold text-slate-900">2. Society Autonomy</h3>
              <p>
                Each housing society operates as an independent administrative unit
                under the direction of its elected management committee. DigiVahivat
                provides software infrastructure and is not responsible for internal
                society policy disputes.
              </p>
            </div>
          </div>
        )}

        {isSupport && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#00AFEF] flex items-center justify-center">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Help & Support</h1>
                  <p className="text-xs text-slate-500">We are here to assist your society</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                <p>
                  Need help resetting your password, setting up a new housing society,
                  or configuring your security guard tablet?
                </p>
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-[#00AFEF]" />
                    <span>support@digivahivat.in</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-[#3E4095]" />
                    <span>+91 98765 43210</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Contact Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Submit an Inquiry
              </h3>
              {submitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-950">Inquiry Received</h4>
                  <p className="text-xs text-emerald-800">
                    Thank you. A representative will contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Committee Member"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email or Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Contact email or 10-digit mobile"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Message / Issue
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Describe your issue or onboarding question..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
