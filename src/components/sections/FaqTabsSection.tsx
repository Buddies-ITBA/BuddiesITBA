'use client';

import Image from 'next/image';
import { useState } from 'react';

export type FaqTab = {
  id: string;
  label: string;
  title: string;
  image: string;
  content: Array<{ type: 'text' | 'list' | 'callout'; value: string | string[] }>;
};

export function FaqTabsSection({ tabs }: { tabs: FaqTab[] }) {
  const [activeTab, setActiveTab] = useState<FaqTab>(tabs[0]);

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab.id === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-muted hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-start">
              <div>
                <h3 className="text-xl font-heading font-semibold text-heading">
                  {activeTab.title}
                </h3>
                <div className="mt-4 space-y-4 text-text-muted">
                  {activeTab.content.map((block, index) => {
                    if (block.type === 'list') {
                      return (
                        <ul key={index} className="list-disc pl-5 space-y-2">
                          {(block.value as string[]).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.type === 'callout') {
                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary"
                        >
                          {block.value as string}
                        </div>
                      );
                    }
                    return <p key={index}>{block.value as string}</p>;
                  })}
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src={activeTab.image}
                  alt={activeTab.label}
                  width={240}
                  height={180}
                  sizes="240px"
                  className="w-full max-w-[220px] rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

