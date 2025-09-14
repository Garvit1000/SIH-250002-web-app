'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatsCard = ({ title, value, icon: Icon, description, color = "primary" }) => {
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    accent: 'text-accent-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    destructive: 'text-destructive'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${colorClasses[color]}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
