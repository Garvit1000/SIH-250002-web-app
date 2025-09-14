'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {Button} from '@/components/ui/button';

const ActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  buttonText, 
  onAction, 
  disabled = false,
  variant = "primary",
  completed = false 
}) => {
  return (
    <Card className={`transition-all hover:shadow-md ${completed ? 'bg-muted/50' : ''}`}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {Icon && (
            <div className={`p-2 rounded-lg ${
              completed ? 'bg-primary/20 text-primary' : 'bg-accent text-accent-foreground'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onAction}
          disabled={disabled || completed}
          variant={completed ? "secondary" : variant}
          className="w-full"
        >
          {completed ? "Completed" : buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActionCard;