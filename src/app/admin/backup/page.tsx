'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Shield, Clock, Database, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminBackupPage() {
  const { data: session } = useSession()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/admin/export')
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Admin access required')
          return
        }
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cardeals-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Backup downloaded successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600">Please sign in to access the admin panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Backup</h1>
          <p className="text-gray-600">
            Manage and download backups of your crowdsourced car deals data
          </p>
        </div>

        <div className="grid gap-6">
          {/* Export Data Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Manual Data Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Download a complete backup of all your data including deals, makes, models, and user information.
              </p>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Database className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Backup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Backup Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Automated Backups</p>
                    <p className="text-sm text-gray-600">Daily at 2:00 AM UTC</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Neon Database</p>
                    <p className="text-sm text-gray-600">Built-in point-in-time recovery</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Backup Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Neon Database Backups</p>
                    <p className="text-sm text-gray-600">
                      Automatic daily backups with point-in-time recovery (check your Neon plan for retention)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">GitHub Actions</p>
                    <p className="text-sm text-gray-600">
                      Automated daily backups stored as GitHub artifacts (30-day retention)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Manual Export</p>
                    <p className="text-sm text-gray-600">
                      JSON export of all data for local storage or external backup services
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 text-sm text-orange-700">
                <li>• Download manual backups weekly and store them securely</li>
                <li>• Consider upgrading to Neon Pro for longer backup retention</li>
                <li>• Store critical backups in multiple locations (cloud storage, local drives)</li>
                <li>• Test backup restoration periodically to ensure data integrity</li>
                <li>• Monitor GitHub Actions to ensure automated backups are running</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
