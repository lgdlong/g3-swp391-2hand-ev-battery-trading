interface SpecItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

/**
 * Specification Item Component
 */
export function SpecItem({ icon, label, value }: SpecItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      {icon}
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
