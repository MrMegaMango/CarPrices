'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { Loader2, Car, DollarSign, Calendar } from 'lucide-react'
import { CarMake, CarModel } from '@/types'

const dealFormSchema = z.object({
  makeId: z.string().min(1, 'Please select a make'),
  modelId: z.string().min(1, 'Please select a model'),
  year: z.number().min(1990).max(new Date().getFullYear() + 2),
  trim: z.string().optional(),
  color: z.string().optional(),
  msrp: z.number().positive('MSRP must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  otdPrice: z.number().positive().optional(),
  rebates: z.number().optional(),
  tradeInValue: z.number().optional(),
  dealerName: z.string().optional(),
  dealerLocation: z.string().optional(),
  dealDate: z.string().min(1, 'Please select a deal date'),
  financingRate: z.number().optional(),
  financingTerm: z.number().optional(),
  downPayment: z.number().optional(),
  monthlyPayment: z.number().optional(),
  notes: z.string().optional(),
  isLeased: z.boolean(),
  leaseTermMonths: z.number().optional(),
  mileageAllowance: z.number().optional(),
})

type DealFormData = z.infer<typeof dealFormSchema>

export default function NewDealPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [makes, setMakes] = useState<CarMake[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [filteredModels, setFilteredModels] = useState<CarModel[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showCustomMake, setShowCustomMake] = useState(false)
  const [showCustomModel, setShowCustomModel] = useState(false)
  const [customMakeName, setCustomMakeName] = useState('')
  const [customModelName, setCustomModelName] = useState('')
  const [isCreatingMake, setIsCreatingMake] = useState(false)
  const [isCreatingModel, setIsCreatingModel] = useState(false)

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      isLeased: false,
      dealDate: new Date().toISOString().split('T')[0],
    },
  })

  const selectedMakeId = form.watch('makeId')
  const isLeased = form.watch('isLeased')

  const fetchMakes = async () => {
    try {
      const response = await fetch('/api/makes')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Fetched makes data:', data) // Debug log
      // Ensure data is an array before setting state
      setMakes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching makes:', error)
      setMakes([]) // Ensure makes is always an array
      toast.error('Failed to load car makes')
    }
  }

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Ensure data is an array before setting state
      setModels(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching models:', error)
      setModels([]) // Ensure models is always an array
      toast.error('Failed to load car models')
    }
  }

  const fetchData = useCallback(async () => {
    setIsLoadingData(true)
    await Promise.all([fetchMakes(), fetchModels()])
    setIsLoadingData(false)
  }, [])

  const createCustomMake = async () => {
    if (!customMakeName.trim()) {
      toast.error('Please enter a make name')
      return
    }

    setIsCreatingMake(true)
    try {
      const response = await fetch('/api/makes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: customMakeName.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create make')
      }

      const newMake = await response.json()
      setMakes(prev => [...prev, newMake])
      form.setValue('makeId', newMake.id)
      setCustomMakeName('')
      setShowCustomMake(false)
      toast.success(`Added "${newMake.name}" to car makes`)
    } catch (error) {
      console.error('Error creating make:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create make')
    } finally {
      setIsCreatingMake(false)
    }
  }

  const createCustomModel = async () => {
    if (!customModelName.trim()) {
      toast.error('Please enter a model name')
      return
    }

    if (!selectedMakeId) {
      toast.error('Please select a make first')
      return
    }

    setIsCreatingModel(true)
    try {
      const response = await fetch('/api/models/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: customModelName.trim(),
          makeId: selectedMakeId 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create model')
      }

      const newModel = await response.json()
      setModels(prev => [...prev, newModel])
      
      // Update filtered models if the new model belongs to the selected make
      if (newModel.makeId === selectedMakeId) {
        setFilteredModels(prev => [...prev, newModel])
      }
      
      form.setValue('modelId', newModel.id)
      setCustomModelName('')
      setShowCustomModel(false)
      toast.success(`Added "${newModel.name}" to car models`)
    } catch (error) {
      console.error('Error creating model:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create model')
    } finally {
      setIsCreatingModel(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (selectedMakeId) {
      const filtered = models.filter(model => model.makeId === selectedMakeId)
      setFilteredModels(filtered)
      // Reset model selection when make changes
      if (form.getValues('modelId') && !filtered.find(m => m.id === form.getValues('modelId'))) {
        form.setValue('modelId', '')
      }
    } else {
      setFilteredModels([])
    }
  }, [selectedMakeId, models, form])

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (status === 'loading' || !isClient || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading car data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/api/auth/signin')
    return null
  }

  const onSubmit = async (data: DealFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create price report')
      }

      await response.json()
      toast.success('Price report created successfully!')
      router.push('/deals')
    } catch (error) {
      console.error('Error creating price report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create price report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i + 2)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Share Your Price Report
            </h1>
            <p className="text-gray-600">
              Help others by sharing your car buying experience and pricing details
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span>Vehicle Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="makeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            if (value === '__add_custom__') {
                              setShowCustomMake(true)
                              return
                            }
                            field.onChange(value)
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select make" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(makes) && makes.length > 0 && makes.map((make) => (
                              <SelectItem key={make.id} value={make.id}>
                                {make.name}
                              </SelectItem>
                            ))}
                            <SelectItem 
                              value="__add_custom__" 
                              onClick={(e) => {
                                e.preventDefault()
                                setShowCustomMake(true)
                              }}
                              className="text-blue-600 font-medium"
                            >
                              + Add Custom Make
                            </SelectItem>
                            {makes.length === 0 && (
                              <SelectItem value="" disabled>
                                Loading makes...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        
                        {/* Custom Make Input */}
                        {showCustomMake && (
                          <div className="mt-2 p-3 border rounded-md bg-blue-50">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Enter custom make name"
                                value={customMakeName}
                                onChange={(e) => setCustomMakeName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    createCustomMake()
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                onClick={createCustomMake}
                                disabled={isCreatingMake || !customMakeName.trim()}
                                size="sm"
                              >
                                {isCreatingMake ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Add'
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowCustomMake(false)
                                  setCustomMakeName('')
                                }}
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            if (value === '__add_custom_model__') {
                              setShowCustomModel(true)
                              return
                            }
                            field.onChange(value)
                          }} 
                          value={field.value} 
                          disabled={!selectedMakeId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(filteredModels) && filteredModels.length > 0 && filteredModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                            {selectedMakeId && (
                              <SelectItem 
                                value="__add_custom_model__" 
                                onClick={(e) => {
                                  e.preventDefault()
                                  setShowCustomModel(true)
                                }}
                                className="text-blue-600 font-medium"
                              >
                                + Add Custom Model
                              </SelectItem>
                            )}
                            {!selectedMakeId && (
                              <SelectItem value="" disabled>
                                Select a make first
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        
                        {/* Custom Model Input */}
                        {showCustomModel && (
                          <div className="mt-2 p-3 border rounded-md bg-blue-50">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Enter custom model name"
                                value={customModelName}
                                onChange={(e) => setCustomModelName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    createCustomModel()
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                onClick={createCustomModel}
                                disabled={isCreatingModel || !customModelName.trim()}
                                size="sm"
                              >
                                {isCreatingModel ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Add'
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowCustomModel(false)
                                  setCustomModelName('')
                                }}
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trim (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., LX, EX, Sport" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Red, Blue, White" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Pricing Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="msrp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MSRP ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="35000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Manufacturer&apos;s Suggested Retail Price</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="32000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Final negotiated price before taxes/fees</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otdPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Out-the-Door Price ($) (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="34500" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>Total price including taxes, fees, etc.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rebates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rebates/Incentives ($) (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2000" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tradeInValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade-in Value ($) (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="8000" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Deal Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Deal Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dealDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dealerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dealer Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Honda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dealerLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dealer Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco, CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isLeased"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This is a lease deal</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!isLeased && (
                    <>
                      <FormField
                        control={form.control}
                        name="financingRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Financing Rate (%) (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="5.5" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="financingTerm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Financing Term (months) (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="downPayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Down Payment ($) (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="5000" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {isLeased && (
                    <>
                      <FormField
                        control={form.control}
                        name="leaseTermMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lease Term (months) (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="36" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mileageAllowance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annual Mileage Allowance (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="12000" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="monthlyPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Payment ($) (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="450" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share any additional details about your deal, negotiation process, or tips for other buyers..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/deals')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Report...
                    </>
                  ) : (
                    'Create Report'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
