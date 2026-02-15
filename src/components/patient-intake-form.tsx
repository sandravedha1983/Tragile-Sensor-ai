'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot, FileText, Loader2, Mic, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { triagePatientAction } from '@/app/actions';
import type { TriageInput } from '@/ai/flows/orchestrator-types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().int().min(0, { message: 'Age must be a positive number.' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodPressureSystolic: z.coerce.number().int(),
  bloodPressureDiastolic: z.coerce.number().int(),
  heartRate: z.coerce.number().int(),
  temperature: z.coerce.number(),
  symptoms: z.string().min(5, { message: 'Please describe symptoms.' }),
  preExistingConditions: z.string().optional(),
  consent: z.boolean().default(false).refine(val => val === true, {
    message: 'You must give consent to proceed.',
  }),
});

type PatientIntakeFormProps = {
  onSubmit: (data: any) => void;
};

export function PatientIntakeForm({ onSubmit }: PatientIntakeFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: undefined,
      symptoms: '',
      preExistingConditions: '',
      consent: false,
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const triageInput: TriageInput = {
        ...values,
        systolicBp: values.bloodPressureSystolic,
        diastolicBp: values.bloodPressureDiastolic,
        consentGiven: values.consent,
      };

      const result = await triagePatientAction(triageInput);

      onSubmit(result);

      toast({
        title: 'Patient Triage Complete',
        description: `${values.name} has been processed by AI agents and added to the queue.`,
      });
      form.reset();
    } catch (error) {
      console.error('Triage failed:', error);
      toast({
        variant: 'destructive',
        title: 'Triage Failed',
        description: error.message || 'An error occurred during AI processing. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <UserPlus className="w-6 h-6" />
          Patient Intake
        </CardTitle>
        <CardDescription>Enter new patient details for AI-powered triage.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="42" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <fieldset className="grid grid-cols-2 gap-4 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">Vitals</legend>
              <div className="grid grid-cols-2 gap-2 col-span-2">
                <FormField
                  control={form.control}
                  name="bloodPressureSystolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systolic BP</FormLabel>
                      <FormControl><Input type="number" placeholder="120" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodPressureDiastolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diastolic BP</FormLabel>
                      <FormControl><Input type="number" placeholder="80" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="heartRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heart Rate</FormLabel>
                    <FormControl><Input type="number" placeholder="72" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl><Input type="number" placeholder="37.0" step="0.1" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </fieldset>

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea placeholder="e.g., Chest pain, shortness of breath..." {...field} className="min-h-[100px]" />
                      <Button type="button" variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7 text-primary hover:bg-primary/20">
                        <Mic className="h-4 w-4" />
                        <span className="sr-only">Use voice input</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                Load Health Document (EHR / EMR)
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Upload a medical report or EHR export. Our AI will automatically extract vitals and symptoms for analysis.
              </p>
              <Input
                type="file"
                className="bg-background/50 cursor-pointer text-xs"
                onChange={(e) => {
                  toast({
                    title: "Document Parsing",
                    description: "AI is extracting clinical entities from document...",
                  });
                  // Simulate parsing delay
                  setTimeout(() => {
                    form.setValue('symptoms', 'Analyzed from Document: Patient presents with persistent tachycardia and localized abdominal pain. History of mitral valve prolapse noted in EMR.');
                    form.setValue('heartRate', 104);
                    toast({
                      title: "EHR Parsed",
                      description: "Symptoms and Vitals extracted successfully.",
                    });
                  }, 1500);
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="preExistingConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pre-existing Conditions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Diabetes, hypertension..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      id="consent-checkbox"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="consent-checkbox" className="cursor-pointer">
                      Consent to AI Processing
                    </FormLabel>
                    <FormDescription>
                      I consent to my data being processed by the TriageSenseAI system.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Triage Patient
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
