import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DiagnosticData {
  status: string;
  database: {
    status: string;
    error?: string;
    orderCount: number;
  };
  session: {
    status: string;
    error?: string;
    userRole?: string;
  };
  environment: Record<string, string>;
  timestamp: string;
}

export default function OrdersDiagnostic() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const response = await fetch('/api/cleanup', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('🧹 Cleanup successful:', data);
        alert(`Cleanup completed!\nDeleted ${data.actions.deletedOrphanItems} orphan items\nFound ${data.actions.foundEmptyOrders} empty orders`);
        // Re-run diagnostic after cleanup
        runDiagnostic();
      } else {
        console.error('❌ Cleanup failed:', data);
        alert('Cleanup failed: ' + data.details);
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      alert('Cleanup failed: ' + error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/health', {
        credentials: 'include',
      });
      const data = await response.json();
      setDiagnosticData(data);
      console.log('🏥 Diagnostic results:', data);
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      setDiagnosticData({
        status: 'error',
        database: { status: 'error', error: 'Failed to run diagnostic', orderCount: 0 },
        session: { status: 'error', error: 'Failed to check session' },
        environment: {},
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
      case 'error':
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' || status === 'connected' || status === 'valid' 
      ? 'default' 
      : status === 'error' || status === 'unhealthy' || status === 'invalid'
      ? 'destructive'
      : 'secondary';
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          System Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <Button 
            onClick={runDiagnostic} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Diagnostic
          </Button>
          
          <Button 
            onClick={runCleanup} 
            disabled={isCleaningUp || isLoading}
            size="sm"
            variant="destructive"
          >
            {isCleaningUp ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              '🧹'
            )}
            Cleanup Database
          </Button>
          
          {diagnosticData && (
            <Button 
              onClick={() => setShowDetails(!showDetails)}
              size="sm"
              variant="ghost"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          )}
        </div>

        {diagnosticData && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(diagnosticData.status)}
              <span className="font-medium">Overall Status:</span>
              {getStatusBadge(diagnosticData.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(diagnosticData.database.status)}
                  <span className="font-medium">Database</span>
                  {getStatusBadge(diagnosticData.database.status)}
                </div>
                <p className="text-sm text-gray-600">
                  Orders: {diagnosticData.database.orderCount}
                </p>
                {diagnosticData.database.error && (
                  <p className="text-sm text-red-600 mt-1">
                    Error: {diagnosticData.database.error}
                  </p>
                )}
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(diagnosticData.session.status)}
                  <span className="font-medium">Authentication</span>
                  {getStatusBadge(diagnosticData.session.status)}
                </div>
                {diagnosticData.session.userRole && (
                  <p className="text-sm text-gray-600">
                    Role: {diagnosticData.session.userRole}
                  </p>
                )}
                {diagnosticData.session.error && (
                  <p className="text-sm text-red-600 mt-1">
                    Error: {diagnosticData.session.error}
                  </p>
                )}
              </div>
            </div>

            {showDetails && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Environment Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(diagnosticData.environment).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className={value === 'missing' ? 'text-red-600' : 'text-green-600'}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Last check: {new Date(diagnosticData.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}