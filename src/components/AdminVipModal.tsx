import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  X,
  Users,
  Search,
  CheckCircle,
  Copy,
  RefreshCw,
  Cloud,
} from 'lucide-react';
import {
  fetchAllVipMembers,
  subscribeToVipMembers,
  downloadVipExcel,
  generateVipCsv,
  VipMember,
} from '../utils/vip';

interface AdminVipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminVipModal: React.FC<AdminVipModalProps> = ({ isOpen, onClose }) => {
  const [members, setMembers] = useState<VipMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedAllCsv, setCopiedAllCsv] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    // Realtime subscription to Firebase Cloud Firestore
    const unsubscribe = subscribeToVipMembers((updated) => {
      setMembers(updated);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    const data = await fetchAllVipMembers();
    setMembers(data);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.contact.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      (m.type === 'phone' ? 'مۆبایل' : 'ئیمەیڵ').includes(q)
    );
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyCsvText = () => {
    const csv = generateVipCsv(members);
    navigator.clipboard.writeText(csv);
    setCopiedAllCsv(true);
    setTimeout(() => setCopiedAllCsv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-[#FAF9F5] border border-[#DECFC0] rounded-md shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#1A1816]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3D9] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#1A1816] text-[#E5B887] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1A1816] flex items-center gap-2">
                <span>تۆماری کڕیارانی VIP (Firebase Cloud)</span>
                <span className="px-2 py-0.5 rounded-full bg-[#8C532B]/10 text-[#8C532B] text-xs font-mono font-semibold">
                  {members.length} کڕیار
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Cloud className="w-3 h-3" />
                  داتابەیسی هەور
                </span>
              </h3>
              <p className="text-xs text-[#6E6154] mt-0.5">
                تەواوی کۆدەکان، ژمارەی مۆبایل و ئیمەیڵەکان ڕاستەوخۆ لە سێرڤەری هەور دەخوێندرێنەوە
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#7D7063] hover:bg-[#F3EDE4] hover:text-[#1A1816] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-[#F5EFEB] border-b border-[#EAE3D9] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8C7B6E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="گەڕان بەپێی ژمارە، ئیمەیڵ، یان کۆد..."
              className="w-full bg-white border border-[#D8CABE] rounded-sm py-1.5 pr-9 pl-3 text-xs focus:outline-hidden focus:border-[#1A1816]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadVipExcel(members)}
              className="px-3.5 py-1.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="داگرتنی فایلی ئێگزڵ بۆ کۆمپیوتەر"
            >
              <Download className="w-3.5 h-3.5" />
              <span>داگرتنی فایلی ئێگزڵ (.CSV)</span>
            </button>

            <button
              onClick={handleCopyCsvText}
              className="px-3 py-1.5 rounded-sm border border-[#D0C2B4] bg-white hover:bg-[#F7F3EE] text-xs font-medium text-[#222] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="کۆپیکردنی هەموو دێڕەکان"
            >
              {copiedAllCsv ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-700">کۆپیکرا</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8C532B]" />
                  <span>کۆپیکردنی داتا</span>
                </>
              )}
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-sm border border-[#D0C2B4] bg-white hover:bg-[#F7F3EE] text-[#444] transition-colors cursor-pointer disabled:opacity-50"
              title="نوێکردنەوە لە سێرڤەر"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#8C532B]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && members.length === 0 ? (
            <div className="text-center py-12 text-[#8C7B6E]">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#8C532B]" />
              <p className="text-xs">بارکردنی داتاکان لە داتابەیسی هەورەوە...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-[#8C7B6E]">
              <Users className="w-10 h-10 mx-auto mb-2 text-[#C4B5A5]" />
              <p className="font-medium text-sm text-[#332A22]">هیچ تۆمارێک لە داتابەیسدا نییە</p>
              <p className="text-xs text-[#8A7B6E] mt-1 max-w-sm mx-auto">
                هەر کڕیارێک لەمەودوا ژمارەی مۆبایل یان ئیمەیڵی خۆی بنووسێت، ڕاستەوخۆ دەچێتە داتابەیسی هەور و هەرگیز ناسڕێتەوە.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E2D5C7] rounded-sm bg-white shadow-2xs">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1A1816] text-[#FAF9F5] border-b border-[#3A3229]">
                    <th className="py-2.5 px-3 text-start font-medium">#</th>
                    <th className="py-2.5 px-3 text-start font-medium">کۆدی داشکاندنی VIP</th>
                    <th className="py-2.5 px-3 text-start font-medium">ژمارەی مۆبایل / ئیمەیڵ</th>
                    <th className="py-2.5 px-3 text-start font-medium">جۆر</th>
                    <th className="py-2.5 px-3 text-start font-medium">داشکاندن</th>
                    <th className="py-2.5 px-3 text-start font-medium">بەرواری تۆمارکردن</th>
                    <th className="py-2.5 px-3 text-center font-medium">کردار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9]">
                  {filteredMembers.map((m, idx) => {
                    const isCopied = copiedCode === m.code;
                    const dateFormatted = new Date(m.date).toLocaleString('en-GB', {
                      timeZone: 'Asia/Baghdad',
                    });

                    return (
                      <tr key={m.code + idx} className="hover:bg-[#FAF6F0] transition-colors">
                        <td className="py-2.5 px-3 text-[#7D7063] font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold tracking-wider text-[#8C532B] bg-[#FAF3EA] px-2 py-0.5 rounded-sm border border-[#ECD9C5]">
                            {m.code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#1A1816] dir-ltr text-end sm:text-start">
                          {m.contact}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[11px] font-medium ${
                              m.type === 'phone'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {m.type === 'phone' ? 'مۆبایل' : 'ئیمەیڵ'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">20% OFF</td>
                        <td className="py-2.5 px-3 text-[#6E6154] dir-ltr text-end sm:text-start">
                          {dateFormatted}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleCopyCode(m.code)}
                            className="p-1 rounded-sm text-[#66584B] hover:text-[#1A1816] hover:bg-[#EFE7DE] transition-colors cursor-pointer"
                            title="کۆپیکردنی کۆد"
                          >
                            {isCopied ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-[#EAE3D9] bg-white text-xs text-[#7D7063] flex flex-wrap items-center justify-between gap-2">
          <span>
            داتاکان بە شێوەی ڕاستەوخۆ (Realtime) لە <strong>Firebase Firestore</strong> کۆدەکرێنەوە. دەتوانیت فایلی ئێگزڵ دابگریت.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-sm bg-[#1A1816] text-[#FAF9F5] text-xs font-medium hover:bg-[#332A22] transition-colors cursor-pointer"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
};
