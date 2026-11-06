import { z } from 'zod';

/**
 * Standard UPI Virtual Payment Address (VPA) regex pattern:
 * e.g., username@bank, 9079879010@fam, company.desk@icici
 */
export const UPI_VPA_REGEX = /^[\w.-]+@[\w.-]+$/;

/**
 * Indian Mobile Number Regex (10 digits with optional +91 or leading 0):
 * e.g., +91 90798 79010, 9820011223
 */
export const INDIAN_PHONE_REGEX = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;

/**
 * Validatable work asset URLs (Google Drive, YouTube, Vimeo, Figma, GitHub):
 */
export const ASSET_URL_REGEX = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/.*)?$/i;

/**
 * Authentication Form Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid work email address (e.g., name@company.com).' })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .min(6, { message: 'Password must be at least 6 characters long.' }),
  role: z.enum(['freelancer', 'client'], {
    message: 'Please select a valid platform role (Freelancer or Client).',
  }),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Quick UPI Invoice Generation Schema
 */
export const quickInvoiceSchema = z.object({
  clientName: z
    .string()
    .min(2, { message: 'Client name must be at least 2 characters.' })
    .max(80, { message: 'Client name cannot exceed 80 characters.' })
    .trim(),
  clientPhone: z
    .string()
    .min(10, { message: 'Please enter a valid 10-digit phone number for WhatsApp delivery.' })
    .regex(INDIAN_PHONE_REGEX, {
      message: 'Enter a valid Indian mobile number (e.g., +91 90798 79010 or 9820011223).',
    }),
  amount: z
    .number()
    .positive({ message: 'Invoice amount must be greater than zero.' })
    .max(5000000, { message: 'Single tranche limit cannot exceed ₹50,00,000 for standard UPI intent.' }),
  taskDescription: z
    .string()
    .min(3, { message: 'Scope description must be at least 3 characters (e.g., Design Sprint).' })
    .max(120, { message: 'Description cannot exceed 120 characters.' }),
  addGst: z.boolean(),
  freelancerVpa: z
    .string()
    .regex(UPI_VPA_REGEX, { message: 'Enter a valid UPI VPA address (e.g., 9079879010@fam).' }),
  dueDate: z.string(),
});

export type QuickInvoiceFormData = z.infer<typeof quickInvoiceSchema>;

/**
 * Deliverable Version Submission Schema
 */
export const deliverableSubmissionSchema = z.object({
  deliverableId: z.string().min(1, { message: 'Deliverable identifier is required.' }),
  workLink: z
    .string()
    .min(1, { message: 'Asset or review link is required.' })
    .regex(ASSET_URL_REGEX, {
      message: 'Please provide a valid URL link (e.g., Google Drive, YouTube unlisted, Figma, or GitHub).',
    }),
  versionTag: z
    .string()
    .regex(/^v[0-9]+(\.[0-9]+)?$/, { message: 'Version tag must follow standard format (e.g., v2, v3, v2.1).' }),
  submissionNotes: z
    .string()
    .max(500, { message: 'Notes cannot exceed 500 characters.' })
    .optional(),
});

export type DeliverableSubmissionFormData = z.infer<typeof deliverableSubmissionSchema>;

/**
 * Proposal Creation Schema
 */
export const proposalSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Project proposal title must be at least 5 characters.' })
    .max(100, { message: 'Title cannot exceed 100 characters.' }),
  clientName: z
    .string()
    .min(2, { message: 'Client contact name is required.' }),
  clientEmail: z
    .string()
    .email({ message: 'Valid client email address is required for contract delivery.' }),
  clientPhone: z
    .string()
    .regex(INDIAN_PHONE_REGEX, { message: 'Valid 10-digit Indian mobile number is required.' }),
  clientCompany: z.string().optional(),
  totalAmount: z
    .number()
    .positive({ message: 'Total proposal budget must be greater than zero.' }),
  milestones: z
    .array(
      z.object({
        title: z.string().min(2, { message: 'Milestone title is required.' }),
        deliverableDate: z.string().min(1, { message: 'Target completion date is required.' }),
        amount: z.number().positive({ message: 'Milestone tranche amount must be greater than zero.' }),
      })
    )
    .min(1, { message: 'At least one milestone tranche is required for scope protection.' }),
});

export type ProposalFormData = z.infer<typeof proposalSchema>;
