import React, { useState } from 'react';
import { KeyRound, MessageCircle, Smartphone, CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react';
import { OTPRecord } from '../../types';
import { storageService } from '../../services/storageService';

export const OTPStatusView: React.FC = () => {
  const [records, setRecords] = useState<OTPRecord[]>(() => storageService.getOTPRecords());

  const handleRefresh = () => {
    setRecords(storageService.getOTPRecords());
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7A582F]"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A582F]">
              Security &amp; Gateways
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#42240D] tracking-tight">
            OTP Verification Status &amp; Gateway Audit Log
          </h1>
          <p className="text-xs text-[#50443D] max-w-2xl mt-1">
            Real-time ledger of all WhatsApp Business API and SMS Telecom gateway verification dispatches, expiry clocks, and client authentication outcomes.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D4C3B9] text-xs font-bold uppercase tracking-wider text-[#42240D] shadow-sm transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#5C3A21]" />
          <span>Refresh Records</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#D4C3B9]/50 shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <KeyRound className="w-10 h-10 text-[#C49A6C] mx-auto opacity-60" />
            <h3 className="font-serif text-base font-bold text-[#42240D]">No OTP dispatches logged yet</h3>
            <p className="text-xs text-[#82746C]">OTP requests will populate here live as customers sign up or request instant login.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#7A582F] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E2DD]">
                <tr>
                  <th className="py-3.5 px-4">Recipient Phone</th>
                  <th className="py-3.5 px-4">Gateway Channel</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">OTP Privacy &amp; Token</th>
                  <th className="py-3.5 px-4">Issued At</th>
                  <th className="py-3.5 px-4">Attempts</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE9]">
                {records.map((r) => {
                  const isExpired = Date.now() > r.expiresAt;
                  return (
                    <tr key={r.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#42240D]">
                        {r.phone}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.channel === 'whatsapp'
                              ? 'bg-[#25D366]/20 text-emerald-800'
                              : 'bg-[#5C3A21]/20 text-[#42240D]'
                          }`}
                        >
                          {r.channel === 'whatsapp' ? (
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Smartphone className="w-3 h-3 text-[#5C3A21]" />
                          )}
                          <span>{r.channel === 'whatsapp' ? 'WhatsApp API' : 'SMS Gateway'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 uppercase font-semibold text-[10px] text-[#7A582F]">
                        {r.purpose.replace('_', ' ')}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#5C3A21] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#D4C3B9]/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>•••••• (Encrypted Direct Delivery)</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#82746C] text-[11px]">
                        {new Date(r.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-[#50443D]">
                        {r.attempts} / 3
                      </td>

                      <td className="py-3.5 px-4">
                        {r.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Expired</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            <span>Pending (&lt;5m)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
