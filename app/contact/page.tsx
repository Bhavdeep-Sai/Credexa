"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/Toast";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof ContactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitting(true);
    try {
      // Validate with schema manually or through submission
      ContactSchema.parse(data);
      
      // Simulate API submit delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast("Message sent successfully! We'll reply within 24 hours.", "success");
      reset();
    } catch (err) {
      toast("Please fix the validation errors before submitting.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
          Contact Security Support
        </h1>
        <p className="text-muted-foreground text-lg">
          Have a general question, need account help, or want to report a new scam pattern? Get in touch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border/50 space-y-6">
            <h3 className="text-lg font-bold text-foreground">Contact Information</h3>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">Email</div>
                  <a href="mailto:support@credexa.live" className="hover:text-primary transition-colors">
                    support@credexa.live
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">Phone Support</div>
                  <span>+1 (800) 555-CRDX</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">Mon-Fri: 9 AM - 6 PM EST</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">HQ Office</div>
                  <span>100 Security Plaza, Suite 400</span>
                  <div className="text-[10px] text-slate-500">San Francisco, CA 94103</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-8 rounded-2xl border border-border/50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
                  />
                  {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
                  />
                  {errors.email && <span className="text-xs text-rose-500">{errors.email.message}</span>}
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  {...register("subject", { required: "Subject is required" })}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
                />
                {errors.subject && <span className="text-xs text-rose-500">{errors.subject.message}</span>}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Message Details
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message", { required: "Message is required" })}
                  placeholder="Detail your request or the security concern..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all resize-none"
                />
                {errors.message && <span className="text-xs text-rose-500">{errors.message.message}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
