import React, { useState } from 'react';
import { Users, ShieldCheck, MessageCircle, Smartphone, MapPin } from 'lucide-react';
import { CustomerUser } from '../../types';
import { storageService } from '../../services/storageService';

export const ClientsManagementView: React.FC = () => {
  const [customers] = useState<CustomerUser[]>(() => storageService.getAllCustomers());

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#7A582F]"></span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
            Patron Management
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
          VIP Clients &amp; Authenticated Patrons
        </h1>
        <p className="text-xs text-[#50443D] max-w-2xl">
          Overview of registered atelier clients with verified WhatsApp/SMS numbers, loyalty points, and bespoke tailoring measurements.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D4C3B9]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#7A582F] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E2DD]">
              <tr>
                <th className="py-3.5 px-4">Patron Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Mobile / WhatsApp</th>
                <th className="py-3.5 px-4">Verification Gateway</th>
                <th className="py-3.5 px-4">Default City</th>
                <th className="py-3.5 px-4">Loyalty Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE9]">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#42240D] text-sm block">{c.fullName}</span>
                    <span className="text-[10px] text-[#82746C]">ID: {c.id}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#50443D]">{c.email}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#42240D]">{c.phone}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {c.verifiedVia === 'whatsapp' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/20 text-emerald-800">
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5C3A21]/20 text-[#42240D]">
                          <Smartphone className="w-3 h-3 text-[#5C3A21]" />
                          <span>SMS OTP Verified</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#50443D]">
                    {c.addresses[0]?.city || 'Lahore'}, Pakistan
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFDCC6] text-[#2F1502] text-[10px] font-bold uppercase">
                      VIP Elite ({c.loyaltyPoints} pts)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
