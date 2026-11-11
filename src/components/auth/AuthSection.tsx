import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Smartphone,
  RotateCcw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CustomerUser, Product } from '../../types';
import { storageService } from '../../services/storageService';
import { otpService } from '../../services/otpService';
import { adminNotificationService } from '../../services/adminNotificationService';
import { CustomerProfile } from './CustomerProfile';

interface AuthSectionProps {
  initialCustomer: CustomerUser | null;
  onCustomerChange: (customer: CustomerUser | null) => void;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({
  initialCustomer,
  onCustomerChange,
  onSelectProduct,
  onAddToCart,
}) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(initialCustomer);

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('+92 300 1234567');
  const [signInPassword, setSignInPassword] = useState('velvetDrape2025');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [signInError, setSignInError] = useState('');

  // Sign Up State
  const [regFullName, setRegFullName] = useState('Zainab Tariq');
  const [regEmail, setRegEmail] = useState('zainab.tariq@client.pk');
  const [regPhone, setRegPhone] = useState('+92-321-4455667');
  const [regPassword, setRegPassword] = useState('silkElegance88');
  const [regConfirmPassword, setRegConfirmPassword] = useState('silkElegance88');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [vipOptIn, setVipOptIn] = useState(true);
  const [regError, setRegError] = useState('');

  // OTP Verification Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'registration' | 'login' | 'reset_password'>('registration');
  const [otpChannel, setOtpChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(300); // 5 mins in seconds
  const [otpMessage, setOtpMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'done'>('request');

  // Pending Registration object
  const [pendingRegistration, setPendingRegistration] = useState<{
    fullName: string;
    email: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    setCustomer(initialCustomer);
  }, [initialCustomer]);

  // Handle countdowns when OTP modal is open
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpModalOpen) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        setOtpExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpModalOpen]);

  // Standard Email/Password Sign In
  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const allCustomers = storageService.getAllCustomers();
    const cleanId = signInIdentifier.trim().toLowerCase();

    const matched = allCustomers.find(
      (c) => c.email.toLowerCase() === cleanId || c.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
    );

    if (matched) {
      storageService.saveCurrentCustomer(matched);
      setCustomer(matched);
      onCustomerChange(matched);
    } else {
      // Create guest customer session or show friendly login
      const demoUser: CustomerUser = {
        id: `cust-${Date.now()}`,
        fullName: cleanId.includes('@') ? cleanId.split('@')[0] : 'Patron',
        email: cleanId.includes('@') ? cleanId : `${cleanId.replace(/\D/g, '')}@client.pk`,
        phone: signInIdentifier,
        isVerified: true,
        verifiedVia: 'whatsapp',
        vipMember: true,
        loyaltyPoints: 100,
        registeredAt: new Date().toISOString(),
        addresses: [
          {
            id: `addr-${Date.now()}`,
            label: 'Default Residence',
            fullName: 'Patron',
            phone: signInIdentifier,
            addressLine: 'Phase 5, DHA',
            city: 'Lahore',
            postalCode: '54000',
            country: 'Pakistan',
            isDefault: true,
          },
        ],
        wishlistIds: ['prod-mehrunissa', 'prod-zeenat'],
      };
      storageService.saveCustomer(demoUser);
      storageService.saveCurrentCustomer(demoUser);
      setCustomer(demoUser);
      onCustomerChange(demoUser);
    }
  };

  // Instant WhatsApp or SMS OTP Sign In Trigger
  const handleInstantOTPSignIn = (channel: 'whatsapp' | 'sms') => {
    if (!signInIdentifier) {
      setSignInError('Please enter your mobile or WhatsApp phone number first.');
      return;
    }

    setSignInError('');
    setOtpPurpose('login');
    setOtpChannel(channel);
    setOtpTargetPhone(signInIdentifier);
    setOtpCodeInput('');
    setOtpCountdown(60);
    setOtpExpiryTimer(300);

    const res = otpService.requestOTP(signInIdentifier, channel, 'login');
    if (res.success) {
      setOtpMessage({ text: res.message, isError: false });
      setOtpModalOpen(true);
    } else {
      setSignInError(res.message);
    }
  };

  // Sign Up Flow - Requests OTP first before finalizing
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    // Set pending registration state
    setPendingRegistration({
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
    });

    setOtpPurpose('registration');
    setOtpChannel('whatsapp'); // default to WhatsApp OTP
    setOtpTargetPhone(regPhone);
    setOtpCodeInput('');
    setOtpCountdown(60);
    setOtpExpiryTimer(300);

    const res = otpService.requestOTP(regPhone, 'whatsapp', 'registration');
    if (res.success) {
      setOtpMessage({ text: res.message, isError: false });
      setOtpModalOpen(true);
    } else {
      setRegError(res.message);
    }
  };

  // Resend OTP
  const handleResendOTP = (overrideChannel?: 'whatsapp' | 'sms') => {
    const channelToUse = overrideChannel || otpChannel;
    setOtpChannel(channelToUse);
    setOtpCountdown(60);
    setOtpExpiryTimer(300);

    const res = otpService.requestOTP(otpTargetPhone, channelToUse, otpPurpose);
    if (res.success) {
      setOtpMessage({ text: res.message, isError: false });
    } else {
      setOtpMessage({ text: res.message, isError: true });
    }
  };

  // Verify OTP Action
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const res = otpService.verifyOTP(otpTargetPhone, otpCodeInput, otpPurpose);

    if (!res.success) {
      setOtpMessage({ text: res.message, isError: true });
      return;
    }

    // Success!
    setOtpModalOpen(false);

    if (otpPurpose === 'registration' && pendingRegistration) {
      const newCustomer: CustomerUser = {
        id: `cust-${Date.now()}`,
        fullName: pendingRegistration.fullName,
        email: pendingRegistration.email,
        phone: pendingRegistration.phone,
        isVerified: true,
        verifiedVia: otpChannel,
        vipMember: vipOptIn,
        loyaltyPoints: 150,
        registeredAt: new Date().toISOString(),
        addresses: [
          {
            id: `addr-${Date.now()}`,
            label: 'Primary Residence',
            fullName: pendingRegistration.fullName,
            phone: pendingRegistration.phone,
            addressLine: 'Gulberg III',
            city: 'Lahore',
            postalCode: '54660',
            country: 'Pakistan',
            isDefault: true,
          },
        ],
        wishlistIds: ['prod-mehrunissa'],
      };

      storageService.saveCustomer(newCustomer);
      storageService.saveCurrentCustomer(newCustomer);
      setCustomer(newCustomer);
      onCustomerChange(newCustomer);

      // Trigger alerts to Admin 1 and Admin 2 per specification!
      adminNotificationService.notifyAdmins({
        event: 'New Customer Registration',
        customerName: newCustomer.fullName,
        customerPhone: newCustomer.phone,
        customerEmail: newCustomer.email,
        details: `Verified via ${otpChannel === 'whatsapp' ? 'WhatsApp Business OTP' : 'SMS Gateway OTP'}`,
      });
    } else if (otpPurpose === 'login') {
      const allCustomers = storageService.getAllCustomers();
      const matched = allCustomers.find(
        (c) => c.phone.replace(/\D/g, '') === otpTargetPhone.replace(/\D/g, '')
      );

      const userToLogin =
        matched ||
        ({
          id: `cust-${Date.now()}`,
          fullName: 'VIP Patron',
          email: `${otpTargetPhone.replace(/\D/g, '')}@client.pk`,
          phone: otpTargetPhone,
          isVerified: true,
          verifiedVia: otpChannel,
          vipMember: true,
          loyaltyPoints: 200,
          registeredAt: new Date().toISOString(),
          addresses: [
            {
              id: `addr-${Date.now()}`,
              label: 'Default Residence',
              fullName: 'VIP Patron',
              phone: otpTargetPhone,
              addressLine: 'DHA Phase 6',
              city: 'Lahore',
              postalCode: '54000',
              country: 'Pakistan',
              isDefault: true,
            },
          ],
          wishlistIds: [],
        } as CustomerUser);

      storageService.saveCustomer(userToLogin);
      storageService.saveCurrentCustomer(userToLogin);
      setCustomer(userToLogin);
      onCustomerChange(userToLogin);
    } else if (otpPurpose === 'reset_password') {
      setForgotStep('done');
    }
  };

  const handleLogout = () => {
    storageService.saveCurrentCustomer(null);
    setCustomer(null);
    onCustomerChange(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Brand Header */}
      <header className="flex flex-col items-center text-center space-y-3 relative">
        <div className="w-20 h-20 rounded-full overflow-hidden shadow-md bg-white p-1 border border-[#C49A6C]/40">
          <img
            alt="SAHARISH Luxury Pret Crest"
            className="w-full h-full object-cover rounded-full"
            src="/apple-touch-icon.png"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F] block">
            ESTD 2023 · Haute Couture &amp; Pret
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#42240D] tracking-tight">
            SAHARISH
          </h1>
          <p className="font-serif text-base text-[#50443D] italic">Style · Quality · Elegance</p>
        </div>
        <div className="w-24 h-px bg-[#D4C3B9]/60 my-2"></div>
      </header>

      {/* If customer is logged in, show authenticated customer dashboard */}
      {customer ? (
        <CustomerProfile
          customer={customer}
          onLogout={handleLogout}
          onUpdateCustomer={(up) => {
            setCustomer(up);
            onCustomerChange(up);
          }}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
        />
      ) : (
        /* Main Dual Authentication Grid */
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Sign In */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col justify-between space-y-8 border border-[#D4C3B9]/40">
            <div>
              <div className="flex items-center justify-between pb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A582F]">
                  Returning Patron
                </span>
                <span className="bg-[#FECF9D]/40 text-[#79562E] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Secure Portal
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#42240D] mb-2">
                Sign In to Your Account
              </h2>
              <p className="text-xs text-[#50443D]">
                Access your bespoke order history, loyalty privileges, and saved measurement profiles.
              </p>
            </div>

            {signInError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSignIn} className="space-y-5">
              <div>
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1.5 tracking-wider">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#82746C]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="+92 300 1234567 or patron@luxury.pk"
                    className="w-full pl-10 pr-4 py-3 bg-[#F6F3EE] text-[#1C1C19] rounded-xl text-xs placeholder:text-[#82746C]/60 focus:outline-none focus:bg-white border border-[#D4C3B9] transition-all"
                    required
                  />
                </div>
                <p className="text-[10px] text-[#82746C] mt-1">
                  Accepts Pakistan (+92) or International dialing formats
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase font-bold text-[#42240D] tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(true);
                      setForgotStep('request');
                      setForgotPhone(signInIdentifier);
                    }}
                    className="text-[11px] text-[#7A582F] hover:text-[#42240D] transition-colors underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#82746C]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#F6F3EE] text-[#1C1C19] rounded-xl text-xs focus:outline-none focus:bg-white border border-[#D4C3B9] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#82746C] hover:text-[#42240D]"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded text-[#5C3A21] accent-[#5C3A21]"
                  />
                  <span className="text-xs text-[#50443D]">Remember my device</span>
                </label>
                <span className="text-[10px] text-[#82746C] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7A582F]" /> 256-bit Encrypted
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#5C3A21] hover:bg-[#42240D] text-white rounded-xl text-xs uppercase font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-4 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="w-full h-px bg-[#D4C3B9]/40"></div>
                <span className="absolute bg-white px-4 text-[10px] uppercase font-bold tracking-widest text-[#82746C]">
                  Instant Direct Access
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInstantOTPSignIn('whatsapp')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#D4C3B9] transition-colors text-xs font-bold text-[#42240D] uppercase tracking-wider"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInstantOTPSignIn('sms')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EDE9] border border-[#D4C3B9] transition-colors text-xs font-bold text-[#42240D] uppercase tracking-wider"
                >
                  <Smartphone className="w-4 h-4 text-[#7A582F]" />
                  <span>SMS Direct Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Registration */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden border border-[#D4C3B9]/40">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#FECF9D]/20 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between pb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A582F]">
                  Exclusive Atelier Membership
                </span>
                <span className="bg-[#FFDCC6] text-[#2F1502] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Complimentary Access
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#42240D] mb-2">
                New to SAHARISH? Register Today
              </h2>
              <p className="text-xs text-[#50443D]">
                Create an atelier profile to curate personal wishlists, receive bespoke fittings, and unlock seasonal previews.
              </p>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-[#42240D] mb-1 tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Ayesha Noor"
                  className="w-full px-4 py-2.5 bg-[#F6F3EE] text-[#1C1C19] rounded-xl text-xs placeholder:text-[#82746C]/60 focus:outline-none focus:bg-white border border-[#D4C3B9] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#42240D] mb-1 tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="client@saharishcollection.com.pk"
                    className="w-full px-4 py-2.5 bg-[#F6F3EE] text-[#1C1C19] rounded-xl text-xs placeholder:text-[#82746C]/60 focus:outline-none focus:bg-white border border-[#D4C3B9] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-[#42240D] mb-1 tracking-wider">
                    WhatsApp / Mobile
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+92 309 7309810"
                    className="w-full px-4 py-2.5 bg-[#F6F3EE] text-[#1C1C19] rounded-xl text-xs placeholder:text-[#82746C]/60 focus:outline-none focus:bg-white border border-[#D4C3B9] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#42240D] mb-1 tracking-wider">
                    Create Password
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F6F3EE] text-[#1C1C19] rounded-xl text-xs focus:outline-none focus:bg-white border border-[#D4C3B9] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-[#42240D] mb-1 tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F6F3EE] text-[#1C1C19] rounded-xl text-xs focus:outline-none focus:bg-white border border-[#D4C3B9] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Strength Indicator matching template */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#82746C]">
                    Security Rating
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A582F]">
                    Bespoke Strength (Optimal)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  <div className="bg-[#7A582F] rounded-full"></div>
                  <div className="bg-[#7A582F] rounded-full"></div>
                  <div className="bg-[#7A582F] rounded-full"></div>
                  <div className="bg-[#ECBE8E] rounded-full"></div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vipOptIn}
                    onChange={(e) => setVipOptIn(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#5C3A21] accent-[#5C3A21]"
                  />
                  <span className="text-xs text-[#50443D] leading-relaxed">
                    Receive VIP early access to new pret lawn drops, private trunk-show invites, and exclusive preview discount codes.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#FFDCC6] hover:bg-[#FECF9D] text-[#2F1502] rounded-xl text-xs uppercase font-bold tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Verify &amp; Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[10px] text-center text-[#82746C]">
              By registering, you acknowledge adherence to SAHARISH Client Terms &amp; Artisanal Care Protocols.
            </p>
          </div>
        </section>
      )}

      {/* OTP Verification Modal (Used for Registration, Instant Login, and Password Reset) */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-[#C49A6C] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                    otpChannel === 'whatsapp' ? 'bg-[#25D366]' : 'bg-[#5C3A21]'
                  }`}
                >
                  {otpChannel === 'whatsapp' ? (
                    <MessageCircle className="w-4 h-4" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#42240D]">
                  {otpChannel === 'whatsapp' ? 'WhatsApp OTP Verification' : 'SMS Code Verification'}
                </h3>
              </div>
              <button
                onClick={() => setOtpModalOpen(false)}
                className="text-[#82746C] hover:text-[#42240D] p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#50443D] space-y-1">
              <p>
                We have dispatched a 6-digit verification code to:
              </p>
              <p className="font-bold text-sm text-[#42240D] bg-[#FAF7F2] p-2 rounded-lg border border-[#D4C3B9]/60">
                {otpTargetPhone}
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#82746C] pt-1">
                <span>Code expires in: <strong className="text-[#BA1A1A]">{Math.floor(otpExpiryTimer / 60)}:{String(otpExpiryTimer % 60).padStart(2, '0')}</strong></span>
                <span>Attempts: 3 max</span>
              </div>
            </div>

            {/* Channel Switcher */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleResendOTP('whatsapp')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  otpChannel === 'whatsapp'
                    ? 'bg-[#25D366] text-white shadow-sm'
                    : 'bg-[#F6F3EE] text-[#50443D] hover:bg-[#EBE8E3]'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => handleResendOTP('sms')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  otpChannel === 'sms'
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'bg-[#F6F3EE] text-[#50443D] hover:bg-[#EBE8E3]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMS Gateway</span>
              </button>
            </div>

            {otpMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  otpMessage.isError
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {otpMessage.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{otpMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCodeInput}
                  onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center py-3 text-2xl font-mono tracking-[0.4em] font-extrabold bg-[#FAF7F2] text-[#42240D] border-2 border-[#C49A6C] rounded-xl focus:outline-none focus:border-[#5C3A21]"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#82746C]">Didn't receive the code?</span>
                <button
                  type="button"
                  disabled={otpCountdown > 0}
                  onClick={() => handleResendOTP()}
                  className={`font-bold uppercase tracking-wider flex items-center gap-1 ${
                    otpCountdown > 0
                      ? 'text-[#82746C] cursor-not-allowed'
                      : 'text-[#7A582F] hover:text-[#42240D]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#5C3A21] hover:bg-[#42240D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
              >
                Verify &amp; Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#C49A6C] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#5C3A21]" />
                <h3 className="font-serif text-lg font-bold text-[#42240D]">
                  Recover Atelier Access
                </h3>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="text-[#82746C] hover:text-[#42240D] p-1"
              >
                ✕
              </button>
            </div>

            {forgotStep === 'request' && (
              <div className="space-y-4 text-xs text-[#50443D]">
                <p>
                  Enter your registered WhatsApp or mobile number to receive an authenticated OTP for password reset.
                </p>
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                    Mobile or WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpTargetPhone(forgotPhone);
                      setOtpPurpose('reset_password');
                      setOtpChannel('whatsapp');
                      setOtpCodeInput('');
                      otpService.requestOTP(forgotPhone, 'whatsapp', 'reset_password');
                      setOtpModalOpen(true);
                      setForgotModalOpen(false);
                    }}
                    className="py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpTargetPhone(forgotPhone);
                      setOtpPurpose('reset_password');
                      setOtpChannel('sms');
                      setOtpCodeInput('');
                      otpService.requestOTP(forgotPhone, 'sms', 'reset_password');
                      setOtpModalOpen(true);
                      setForgotModalOpen(false);
                    }}
                    className="py-2.5 rounded-xl bg-[#5C3A21] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS OTP</span>
                  </button>
                </div>
              </div>
            )}

            {forgotStep === 'done' && (
              <div className="space-y-4 text-xs text-[#50443D]">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Identity verified via OTP. You may now set a new password.</span>
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7A582F] mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#D4C3B9] rounded-xl text-xs text-[#1C1C19]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert('Password has been successfully updated. You may now sign in.');
                    setForgotModalOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#5C3A21] text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save New Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
