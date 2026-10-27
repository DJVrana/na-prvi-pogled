import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-3.5">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div
            key={idx}
            onClick={() => toggle(idx)}
            className={`group bg-white/75 backdrop-blur-md rounded-2xl border transition-all duration-300 cursor-pointer shadow-xs overflow-hidden select-none ${
              isOpen
                ? 'border-brand/35 ring-2 ring-brand/15 shadow-md bg-white/95'
                : 'border-white/90 hover:border-brand/20 hover:bg-white/90 hover:shadow-sm'
            }`}
          >
            {/* Clickable Header Box - covers entire card when closed */}
            <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
              <span className="font-bold text-brand text-base sm:text-lg leading-snug">
                {item.question}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isOpen
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-brand/5 text-brand group-hover:bg-brand/10'
                }`}
              >
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-white' : 'rotate-0 text-brand-light'
                  }`}
                />
              </div>
            </div>

            {/* Smooth animated accordion drawer for both open & close */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-brand/85 leading-relaxed border-t border-brand/10 pt-3.5 font-normal select-text"
                  onClick={(e) => {
                    // Prevent closing if user clicks a link or text inside answer
                    e.stopPropagation();
                  }}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
