import React from 'react';

interface SummaryCardProps {
  title: string;
  amount: string;
  change: string;
  icon: React.ReactNode;
  tone: 'green' | 'orange' | 'blue' | 'purple';
}

export function SummaryCard({ title, amount, change, icon, tone }: SummaryCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <span className={`metric-icon ${tone}`}>{icon}</span>
      </div>
      <strong className="metric-amount">{amount}</strong>
      <div className="metric-change">
        <span className="change-dot" />
        <span>{change}</span>
      </div>
    </div>
  );
}
