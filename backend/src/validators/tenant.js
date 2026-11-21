const { z } = require('zod');

const updateTenantSchema = z.object({
  companyName: z.string().min(1).max(120).optional(),
  segment: z.enum(['retail', 'services', 'restaurant', 'clinic', 'education', 'other']).optional(),
  description: z.string().max(2000).optional(),
  phone: z.string().max(40).optional(),
  address: z.string().max(500).optional(),
  workingHours: z.record(z.any()).optional(),
  timezone: z.string().min(1).max(60).optional(),
  products: z.array(z.any()).optional(),
  services: z.array(z.any()).optional(),
  faq: z.array(z.any()).optional(),
  policies: z.string().max(5000).optional(),
});

module.exports = { updateTenantSchema };