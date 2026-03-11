# shadcn/ui Migration - Quick Reference & Examples

## Overview
This document provides quick reference and before/after code examples for migrating raw HTML elements to shadcn/ui components.

---

## 1. BUTTON MIGRATIONS

### Pattern 1: Link-Style Button
**Before:**
```tsx
<button
  type="button"
  onClick={() => navigate("/signup")}
  className="text-blue-600 hover:underline"
>
  Don't have an account? Sign up
</button>
```

**After:**
```tsx
import { Button } from "@/components/ui/button";

<Button 
  variant="link" 
  onClick={() => navigate("/signup")}
>
  Don't have an account? Sign up
</Button>
```

---

### Pattern 2: Primary/Default Button
**Before:**
```tsx
<button 
  type="submit" 
  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
>
  Submit
</button>
```

**After:**
```tsx
import { Button } from "@/components/ui/button";

<Button type="submit">
  Submit
</Button>
```

---

### Pattern 3: Outline Button
**Before:**
```tsx
<button 
  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
>
  Cancel
</button>
```

**After:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline">
  Cancel
</Button>
```

---

### Pattern 4: Ghost Button
**Before:**
```tsx
<button 
  onClick={onClose}
  className="text-gray-500 hover:text-gray-700"
>
  Back
</button>
```

**After:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="ghost">
  Back
</Button>
```

---

### Pattern 5: Icon Button
**Before:**
```tsx
<button 
  onClick={onClose}
  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
>
  ✕
</button>
```

**After:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="ghost" size="icon">
  ✕
</Button>
```

---

### Pattern 6: Link with Router Integration
**Before:**
```tsx
import { LinkContainer } from "react-router-bootstrap";

<LinkContainer to="/dashboard">
  <button className="btn btn-primary">
    Go to Dashboard
  </button>
</LinkContainer>
```

**After:**
```tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

<Button asChild>
  <Link to="/dashboard">
    Go to Dashboard
  </Link>
</Button>
```

---

## 2. INPUT MIGRATIONS

### Pattern 1: Text Input
**Before:**
```tsx
<div className="form-group">
  <label htmlFor="firstName">First Name</label>
  <input
    id="firstName"
    type="text"
    {...register("firstName")}
    className="form-control"
    placeholder="Enter first name"
  />
</div>
```

**After:**
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="firstName">First Name</Label>
  <Input
    id="firstName"
    {...register("firstName")}
    placeholder="Enter first name"
  />
</div>
```

---

### Pattern 2: Email Input
**Before:**
```tsx
<input
  type="email"
  {...register("email")}
  className="form-control"
/>
```

**After:**
```tsx
import { Input } from "@/components/ui/input";

<Input
  type="email"
  {...register("email")}
/>
```

---

### Pattern 3: Date Input
**Before:**
```tsx
<input
  type="date"
  {...register("dateOfBirth")}
  className="form-control"
/>
```

**After:**
```tsx
import { Input } from "@/components/ui/input";

<Input
  type="date"
  {...register("dateOfBirth")}
/>
```

---

## 3. CHECKBOX MIGRATIONS

### Pattern: Checkbox with Label
**Before:**
```tsx
<div className="form-check">
  <input
    type="checkbox"
    id="agreeTerms"
    {...register("agreeTerms")}
    className="form-check-input"
  />
  <label className="form-check-label" htmlFor="agreeTerms">
    I agree to the terms and conditions
  </label>
</div>
```

**After:**
```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

<div className="flex items-center space-x-2">
  <Checkbox
    id="agreeTerms"
    {...register("agreeTerms")}
  />
  <Label htmlFor="agreeTerms" className="font-normal">
    I agree to the terms and conditions
  </Label>
</div>
```

---

## 4. SELECT MIGRATIONS

### Pattern: Simple Select Dropdown
**Before:**
```tsx
<div className="form-group">
  <label htmlFor="state">State</label>
  <select
    id="state"
    {...register("state")}
    className="form-control"
  >
    <option value="">Select State</option>
    <option value="CA">California</option>
    <option value="NY">New York</option>
    <option value="TX">Texas</option>
  </select>
</div>
```

**After:**
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="state">State</Label>
  <Select defaultValue={value} onValueChange={(val) => handleChange(val)}>
    <SelectTrigger id="state">
      <SelectValue placeholder="Select State" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="CA">California</SelectItem>
      <SelectItem value="NY">New York</SelectItem>
      <SelectItem value="TX">Texas</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 5. LABEL MIGRATIONS

### Pattern: Label with Form Field
**Before:**
```tsx
<label htmlFor="email" className="text-gray-700 font-medium">
  Email Address
</label>
```

**After:**
```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email Address</Label>
```

---

## 6. ACCORDION MIGRATIONS

### Pattern: Custom Accordion Buttons
**Before:**
```tsx
const [expandedIndex, setExpandedIndex] = useState(0);

<div>
  <button 
    onClick={() => setExpandedIndex(expandedIndex === 0 ? -1 : 0)}
    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
  >
    <span>Event Details</span>
    <span>{expandedIndex === 0 ? '−' : '+'}</span>
  </button>
  {expandedIndex === 0 && (
    <div className="p-4 bg-white border-t">
      Event content here
    </div>
  )}
</div>
```

**After:**
```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="event-1">
    <AccordionTrigger>Event Details</AccordionTrigger>
    <AccordionContent>
      Event content here
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 7. FORM STRUCTURE MIGRATIONS

### Pattern: Complete Form Migration
**Before:**
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div className="form-group">
    <label htmlFor="name">Name</label>
    <input
      id="name"
      type="text"
      {...register("name")}
      className="form-control"
    />
  </div>
  
  <div className="form-group">
    <label htmlFor="email">Email</label>
    <input
      id="email"
      type="email"
      {...register("email")}
      className="form-control"
    />
  </div>

  <button type="submit" className="btn btn-primary">
    Submit
  </button>
</form>
```

**After:**
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<form onSubmit={handleSubmit} className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input
      id="name"
      {...register("name")}
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      {...register("email")}
    />
  </div>

  <Button type="submit">
    Submit
  </Button>
</form>
```

---

## 8. COMMON PATTERNS & TIPS

### Merging Tailwind Classes
Use the `cn()` utility to safely merge Tailwind classes:

```tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

<Button className={cn("custom-class", isHighlight && "ring-2")}>
  Custom Button
</Button>
```

---

### Form Validation Display
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const { formState: { errors } } = useFormContext();

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    {...register("email")}
    className={errors.email ? "border-red-500" : ""}
  />
  {errors.email && (
    <p className="text-sm text-red-500">{errors.email.message}</p>
  )}
</div>
```

---

### Disabling on Submit
```tsx
import { Button } from "@/components/ui/button";

const { formState: { isSubmitting } } = useFormContext();

<Button 
  type="submit" 
  disabled={isSubmitting}
>
  {isSubmitting ? "Submitting..." : "Submit"}
</Button>
```

---

### Loading States
```tsx
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Loading..." : "Action"}
</Button>
```

---

## 9. IMPORT STATEMENTS

### Standard Imports Needed
```tsx
// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Utilities
import { cn } from "@/lib/utils";

// React Router (for Link pattern)
import { Link } from "react-router-dom";
```

---

## 10. DEPENDENCIES TO REMOVE

After all migrations are complete:

```bash
npm uninstall react-bootstrap react-router-bootstrap bootstrap
```

Update `package.json` to remove:
- `react-bootstrap`
- `react-router-bootstrap`
- `bootstrap`

---

## 11. TESTING AFTER MIGRATION

### Test Checklist
- [ ] Component renders without errors
- [ ] Form inputs are focused correctly
- [ ] Form validation displays error messages
- [ ] Form submission works
- [ ] Links navigate correctly
- [ ] Styling looks correct (no missing styles)
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader announces labels correctly
- [ ] All tests pass: `npm test -- --watchAll=false`

---

## 12. RESOURCES

- **shadcn/ui Documentation**: https://ui.shadcn.com/
- **Radix UI Documentation**: https://www.radix-ui.com/
- **React Hook Form with shadcn**: https://react-hook-form.com/form-builder
- **Tailwind CSS**: https://tailwindcss.com/docs
- **FreshTrak AGENTS.md**: ./AGENTS.md

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
