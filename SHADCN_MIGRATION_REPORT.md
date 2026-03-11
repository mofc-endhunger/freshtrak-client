# FreshTrak Client: Raw HTML to shadcn/ui Migration Report

**Generated**: March 11, 2026  
**Scope**: Analysis of raw HTML elements that can be replaced with shadcn/ui components  
**Total Files Analyzed**: 80+  
**Files Requiring Updates**: 18+  

---

## EXECUTIVE SUMMARY

This report identifies instances of raw HTML elements (buttons, inputs, selects, labels) and deprecated Bootstrap components that should be migrated to shadcn/ui components. The migration will:

- ✅ Improve code consistency and maintainability
- ✅ Reduce bundle size (remove react-bootstrap, react-router-bootstrap)
- ✅ Enhance accessibility compliance
- ✅ Standardize component styling
- ✅ Improve type safety with React.FC patterns

**Estimated Effort**: 3-4 weeks across 4 phases  
**Expected Impact**: -15-20KB bundle size reduction

---

## SECTION 1: RAW BUTTON ELEMENTS (25+ instances)

### 1.1 Authentication Forms

#### **File: src/Modules/Authentication/SignInFormComponent.tsx**
- **Line 133-139**: Raw button for "Forgot Password" link
  ```tsx
  <button
    type="button"
    onClick={() => navigate("/reset-password")}
    className="text-blue-600 hover:underline"
  >
    Forgot Password?
  </button>
  ```
  **Replacement**: `<Button variant="link">`

- **Line 163-169**: Raw button for "Sign Up" navigation link
  ```tsx
  <button
    type="button"
    onClick={() => navigate("/signup")}
    className="text-primary hover:text-primary/80"
  >
    Don't have an account? Sign up
  </button>
  ```
  **Replacement**: `<Button variant="link">`

#### **File: src/Modules/Authentication/SignUpFormComponent.tsx**
- **Line 199-205**: Raw button for "Sign In" link
  ```tsx
  <button type="button" onClick={() => navigate("/signin")}>
    Already have an account? Sign In
  </button>
  ```
  **Replacement**: `<Button variant="link">`

#### **File: src/Modules/Authentication/ResetPasswordFormComponent.tsx**
- **~Line 105**: Raw button for back navigation
  **Replacement**: `<Button variant="ghost">Back</Button>`

#### **File: src/Modules/Authentication/ConfirmResetPasswordFormComponent.tsx**
- **~Line 142**: Raw button for back navigation
  **Replacement**: `<Button variant="ghost">Back</Button>`

---

### 1.2 Event Components

#### **File: src/Modules/Events/EventCardComponent.tsx**
- **Line 117-137**: Raw button with "btn" Bootstrap class
  ```tsx
  <button className="btn btn-primary">
    Learn More
  </button>
  ```
  **Replacement**: `<Button>Learn More</Button>` (remove "btn" class)

- **Line 249-258**: Raw button for "View Details"
  ```tsx
  <button className="btn-outline">View Details</button>
  ```
  **Replacement**: `<Button variant="outline">View Details</Button>`

- **Line 260-265**: Raw button for "Get Directions"
  ```tsx
  <button className="text-blue-600">Get Directions</button>
  ```
  **Replacement**: `<Button variant="link">Get Directions</Button>`

- **Note**: File also uses `<LinkContainer>` from react-router-bootstrap (lines 5, 116-138)
  **Replacement**: Use React Router `<Link>` with `asChild` prop

#### **File: src/Modules/Events/EventListComponent.tsx**
- **Line 82, 84**: Raw radio inputs (currently commented out)
  **Replacement**: `<ToggleGroup>` or `<RadioGroup>` component

---

### 1.3 Household & General Components

#### **File: src/Modules/General/HouseHoldEligibilityComponent.tsx**
- **Line 54-60**: Raw button for "View Guidelines"
  ```tsx
  <button type="button" onClick={handleViewGuidelines}>
    View Guidelines
  </button>
  ```
  **Replacement**: `<Button variant="link">View Guidelines</Button>`

#### **File: src/Modules/Home/EventNearByComponent.tsx**
- **Lines 42-60, 73-91, 104-122**: Three custom accordion buttons (3 instances)
  ```tsx
  <button onClick={() => setExpandedIndex(0)}>
    {expandedIndex === 0 ? '−' : '+'}
  </button>
  ```
  **Replacement**: Refactor to use `<Accordion>` component from shadcn

#### **File: src/Modules/Households/components/HouseholdSignUpWrapper.tsx**
- **Line 316-321**: Raw button with inline Tailwind
  ```tsx
  <button className="px-4 py-2 bg-primary text-white rounded">
    Submit
  </button>
  ```
  **Replacement**: `<Button>Submit</Button>`

- **Line 322-327**: Raw cancel button
  **Replacement**: `<Button variant="outline">Cancel</Button>`

#### **File: src/Modules/Households/components/HouseholdCompletionPrompt.tsx**
- **Line 148-153**: Raw close button
  ```tsx
  <button onClick={onClose} className="absolute top-2 right-2">
    ✕
  </button>
  ```
  **Replacement**: `<Button variant="ghost" size="icon">✕</Button>`

- **Line 243-248**: Another close button
  **Replacement**: `<Button variant="ghost" size="icon">✕</Button>`

#### **File: src/Modules/Family/FamilyContainer.tsx**
- **Line 129-170**: Raw submit button
  ```tsx
  <button type="submit" className="btn btn-primary">
    Save Changes
  </button>
  ```
  **Replacement**: `<Button type="submit">Save Changes</Button>`

---

## SECTION 2: RAW INPUT ELEMENTS (20+ instances)

### 2.1 Family Module Form Components

#### **File: src/Modules/Family/PrimaryInfoFormComponent.tsx**
- Multiple `<input type="text">` for first_name, last_name
  **Replacement**: Wrap with `<Input>` component + `<Label>`
  
- Raw `<input type="date">` for date_of_birth
  **Replacement**: `<Input type="date">` wrapped in Form structure

#### **File: src/Modules/Family/AddressComponent.tsx**
- Raw inputs for:
  - address_line_1
  - city
  - zip_code
  - lot_suite
  **Replacement**: Use `<Input>` component with `<Label>` for each field

#### **File: src/Modules/Family/ContactInformationComponent.tsx**
- Multiple `<input type="checkbox">` instances
  **Replacement**: Use `<Checkbox>` component + `<Label>` pattern

#### **File: src/Modules/Family/templates/BaseComponentTemplate.tsx**
- **Lines 175-194**: Raw `<input>` in BaseInput template
  ```tsx
  <input
    type="text"
    {...register('fieldName')}
    className="form-control"
  />
  ```
  **Replacement**: Update template to use `<Input>` component
  **Impact**: This is a template, so update will affect multiple components using it

### 2.2 Other Components

#### **File: src/Modules/General/GooglePlacesAutocomplete.tsx**
- Raw `<input>` for Google Places autocomplete
  **Replacement**: Wrap with `<Input>` component, apply style adjustments for autocomplete

#### **File: src/Modules/General/SearchComponent.tsx**
- Multiple raw `<input>` fields for search/filter
  **Replacement**: Use `<Input>` component for consistency

---

## SECTION 3: RAW SELECT ELEMENTS (5 instances)

#### **File: src/Modules/Family/StateDropdownComponent.tsx**
- **Lines 80-97**: Raw `<select>` for state dropdown
  ```tsx
  <select
    {...register("state")}
    className="form-control"
  >
    <option>Select State</option>
    {/* options */}
  </select>
  ```
  **Replacement**: `<Select>` component from shadcn/ui
  **Note**: This component is likely used in multiple places

#### **File: src/Modules/Family/PrimaryInfoFormComponent.tsx**
- Raw `<select>` for gender field
  **Replacement**: `<Select>` component
  
- Raw `<select>` for relationship field
  **Replacement**: `<Select>` component

#### **File: src/Modules/Family/templates/BaseComponentTemplate.tsx**
- **Lines 215-250**: Raw `<select>` in template
  **Replacement**: `<Select>` component
  **Impact**: Template change affects all dependent components

#### **File: src/Modules/Events/EventListComponent.tsx**
- **Line 91**: Raw `<select>` with "form-control" class
  ```tsx
  <select className="form-control">
    {/* options */}
  </select>
  ```
  **Replacement**: `<Select>` component

---

## SECTION 4: RAW LABEL ELEMENTS (4 instances)

#### **File: src/Modules/Family/PrimaryInfoFormComponent.tsx**
- **Lines 70-76**: Raw `<label>` for "First Name"
  ```tsx
  <label htmlFor="first_name">First Name</label>
  ```
  **Replacement**: `<Label htmlFor="first_name">First Name</Label>`

#### **File: src/Modules/Family/StateDropdownComponent.tsx**
- **Lines 73-79**: Raw `<label>` for "State"
  **Replacement**: `<Label>` component

#### **File: src/Modules/Events/EventListComponent.tsx**
- **Lines 83, 85, 90**: Multiple raw `<label>` elements
  **Replacement**: `<Label>` component

#### **File: src/Modules/Family/ContactInformationComponent.tsx**
- **Line 192**: Raw `<label>` for checkbox
  **Replacement**: `<Label>` component with `asChild` pattern

---

## SECTION 5: BOOTSTRAP CLASSES REQUIRING REMOVAL

### 5.1 Pattern: "btn" class
- **Files**: `EventCardComponent.tsx` (lines 119, 250, 261)
- **Issue**: Using Bootstrap "btn" class with raw buttons
- **Fix**: Remove "btn" class, use `<Button>` component instead

### 5.2 Pattern: "form-group" and "form-control"
- **Files**: `EventListComponent.tsx` (lines 89, 91)
- **Issue**: Bootstrap form styling classes
- **Fix**: Remove Bootstrap wrappers, use shadcn form components structure

### 5.3 Pattern: Custom Bootstrap toggle ("btn-toggle")
- **Files**: `EventListComponent.tsx` (lines 83, 85)
- **Issue**: Custom Bootstrap toggle styling
- **Fix**: Use `<ToggleGroup>` or `<SegmentedControl>` component

---

## SECTION 6: REACT-ROUTER-BOOTSTRAP REMOVAL

### 6.1 LinkContainer Usage

#### **File: src/Modules/Events/EventCardComponent.tsx**
- **Line 5**: Import statement
  ```tsx
  import { LinkContainer } from "react-router-bootstrap";
  ```
  
- **Lines 116-138**: Usage
  ```tsx
  <LinkContainer to={targetUrl}>
    <button>Navigate</button>
  </LinkContainer>
  ```

**Migration Pattern**:
```tsx
// OLD (react-router-bootstrap)
import { LinkContainer } from "react-router-bootstrap";

<LinkContainer to="/path">
  <button>Click</button>
</LinkContainer>

// NEW (shadcn + React Router)
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

<Button asChild>
  <Link to="/path">Click</Link>
</Button>
```

#### **File: src/Modules/Events/ResourceListComponent.tsx**
- **Lines 168-172**: LinkContainer wrapper usage
  **Replacement**: Use `<Button asChild>` + React Router `<Link>`

---

## SECTION 7: PRIORITY MIGRATION ROADMAP

### **PHASE 1: CRITICAL (Week 1) - Foundation**
1. ✅ `src/Modules/Family/PrimaryInfoFormComponent.tsx` - **HIGH IMPACT**
   - 5+ inputs, 3+ selects, 3+ labels
   - Used in multiple registration flows
   
2. ✅ `src/Modules/Family/StateDropdownComponent.tsx` - **BLOCKING**
   - Component used across multiple modules
   - Simple 1 select + 1 label replacement
   
3. ✅ `src/Modules/Family/AddressComponent.tsx` - **HIGH IMPACT**
   - Multiple input fields
   - Critical for household registration
   
4. ✅ `src/Modules/Family/ContactInformationComponent.tsx` - **MEDIUM IMPACT**
   - Checkbox inputs to migrate
   - Used in family setup
   
5. ✅ `src/Modules/Family/templates/BaseComponentTemplate.tsx` - **FOUNDATION**
   - Template impacts multiple components
   - Updating here reduces repeated work

**Phase 1 Effort**: 30-40 hours  
**Testing Required**: Form validation, accessibility, styling

---

### **PHASE 2: HIGH PRIORITY (Week 2) - Event & Auth**
6. ✅ `src/Modules/Events/EventCardComponent.tsx` - **VISIBILITY**
   - 3+ buttons, LinkContainer usage
   - Public-facing component
   
7. ✅ `src/Modules/Events/EventListComponent.tsx` - **COMPLEX**
   - Select, labels, radio buttons
   - Filter/search functionality
   
8. ✅ `src/Modules/Authentication/SignInFormComponent.tsx` - **CRITICAL PATH**
   - 2 navigation buttons
   - Core user flow
   
9. ✅ `src/Modules/Authentication/SignUpFormComponent.tsx` - **CRITICAL PATH**
   - 1 navigation button
   - Core user flow
   
10. ✅ `src/Modules/Home/EventNearByComponent.tsx` - **ACCORDION**
    - 3 accordion buttons
    - Refactor to `<Accordion>` component

**Phase 2 Effort**: 25-30 hours  
**Testing Required**: Navigation flows, event interactions, styling

---

### **PHASE 3: MEDIUM PRIORITY (Week 3) - Households**
11. ✅ `src/Modules/Households/components/HouseholdSignUpWrapper.tsx`
    - 2 buttons to migrate
    
12. ✅ `src/Modules/Households/components/HouseholdCompletionPrompt.tsx`
    - 2 close buttons (icon buttons)
    
13. ✅ `src/Modules/General/HouseHoldEligibilityComponent.tsx`
    - 1 link button
    
14. ✅ `src/Modules/Family/FamilyContainer.tsx`
    - 1 submit button

**Phase 3 Effort**: 15-20 hours  
**Testing Required**: Modal interactions, form submission

---

### **PHASE 4: LOWER PRIORITY (Week 4) - General Components**
15. ✅ `src/Modules/Header/HeaderComponent.tsx` - Review and migrate buttons
16. ✅ `src/Modules/General/GooglePlacesAutocomplete.tsx` - Wrap input with `<Input>`
17. ✅ `src/Modules/General/SearchComponent.tsx` - Multiple input migrations
18. ✅ `src/Modules/Authentication/ResetPasswordFormComponent.tsx`
19. ✅ `src/Modules/Authentication/ConfirmResetPasswordFormComponent.tsx`

**Phase 4 Effort**: 15-20 hours  
**Testing Required**: Search, autocomplete, form validation

---

## SECTION 8: COMPONENT MAPPING REFERENCE

| Raw HTML | shadcn/ui Component | Example |
|----------|-------------------|---------|
| `<button type="button">Text</button>` | `<Button>Text</Button>` | Default variant |
| `<button>Link Text</button>` (styled as link) | `<Button variant="link">Link Text</Button>` | Text-only buttons |
| `<button>Outline Button</button>` (outline style) | `<Button variant="outline">Outline Button</Button>` | Secondary buttons |
| `<button>Ghost Button</button>` (minimal) | `<Button variant="ghost">Ghost Button</Button>` | Minimal buttons |
| `<button>✕</button>` (close) | `<Button variant="ghost" size="icon">✕</Button>` | Icon buttons |
| `<input type="text">` | `<Input placeholder="Text">` | Text input |
| `<input type="email">` | `<Input type="email">` | Email input |
| `<input type="date">` | `<Input type="date">` | Date input |
| `<input type="checkbox">` | `<Checkbox>` | With Label asChild |
| `<input type="radio">` | `<RadioGroup>` + `<RadioGroupItem>` | Or ToggleGroup |
| `<select>` | `<Select>` | Radix-based dropdown |
| `<label>` | `<Label>` | Semantic improvement |
| Custom accordion | `<Accordion>` | EventNearByComponent |
| `<LinkContainer to="">` | `<Button asChild><Link to="">` | React Router integration |

---

## SECTION 9: MIGRATION CHECKLIST

### Pre-Migration
- [ ] Review all identified files
- [ ] Create feature branch for Phase 1
- [ ] Backup current components
- [ ] Install/verify shadcn/ui components are available

### During Migration
- [ ] Update imports in each file
- [ ] Replace raw HTML elements
- [ ] Update className references (remove Bootstrap classes)
- [ ] Test form validation and submission
- [ ] Test styling and responsive design
- [ ] Test accessibility (ARIA labels, keyboard navigation)
- [ ] Update component tests if needed

### Post-Migration (Per Phase)
- [ ] Run full test suite: `npm test -- --watchAll=false`
- [ ] Visual regression testing
- [ ] Cross-browser testing
- [ ] Performance check (bundle size)
- [ ] Deploy to staging and QA

### Final Steps (After All Phases)
- [ ] Remove deprecated dependencies:
  - `react-bootstrap`
  - `react-router-bootstrap`
  - `bootstrap` (if not used elsewhere)
- [ ] Update AGENTS.md with new patterns
- [ ] Create migration guide for team
- [ ] Document custom Button variants added

---

## SECTION 10: DEPENDENCIES TO REMOVE (Post-Migration)

After completing all phases:

```json
{
  "dependencies_to_remove": [
    "react-bootstrap",
    "bootstrap"
  ],
  "dependencies_to_verify": [
    "semantic-ui-react",
    "semantic-ui-css"
  ]
}
```

**Estimated bundle size reduction**: 15-20KB

---

## SECTION 11: KEY BENEFITS OF MIGRATION

✅ **Code Consistency**
- Single component library (shadcn) instead of multiple (Bootstrap, Semantic UI, Radix)
- Unified styling approach with Tailwind CSS

✅ **Accessibility Improvement**
- shadcn components built on Radix UI (WAI-ARIA compliant)
- Better keyboard navigation and screen reader support
- Proper ARIA labels and roles

✅ **Bundle Size Reduction**
- Remove react-bootstrap dependency (-8KB)
- Remove react-router-bootstrap dependency (-3KB)
- Better tree-shaking with composable components (-4KB)
- Total: ~15-20KB reduction

✅ **Developer Experience**
- Type-safe components with TypeScript
- Consistent prop patterns across all components
- Better IntelliSense and auto-completion
- Easier to maintain and test

✅ **Styling Flexibility**
- All components styled with Tailwind CSS
- Easy to customize with CVA (class-variance-authority)
- Consistent color and spacing system
- No conflicting CSS frameworks

✅ **Future-Proofing**
- shadcn/ui is actively maintained
- Radix UI provides solid foundation
- Aligns with modern React patterns

---

## SECTION 12: TESTING STRATEGY

### Unit Tests
- Test each component renders correctly after migration
- Verify form inputs work with React Hook Form
- Test validation messages appear correctly
- Test accessibility attributes (data-testid, aria-label)

### Integration Tests
- Test form submission workflows
- Test navigation between screens
- Test state management integration

### Visual Regression Tests
- Screenshot comparison of old vs. new components
- Responsive design testing (mobile, tablet, desktop)
- Cross-browser testing

### Accessibility Tests
- Keyboard navigation
- Screen reader testing
- ARIA compliance

### Performance Tests
- Bundle size analysis
- Component render performance
- No layout shifts or jank

---

## SECTION 13: KNOWN ISSUES & CONSIDERATIONS

### Styling Conflicts
- **Issue**: Some components may have custom Tailwind classes that conflict with shadcn defaults
- **Solution**: Use `cn()` utility to merge classes safely, verify in browser

### Form State Management
- **Note**: Ensure React Hook Form integration still works after migration
- **Check**: Validation messages, error states, touched state

### Accessible Autocomplete
- **Issue**: Google Places autocomplete may need style adjustments
- **Solution**: Wrap with Input component but may need custom styling

### Radio Buttons vs. Toggle Group
- **Decision**: EventListComponent uses radio-like buttons, can use either `<RadioGroup>` or `<ToggleGroup>`
- **Recommendation**: Use `<RadioGroup>` for semantic correctness

### AccordionComponent Refactor
- **Issue**: EventNearByComponent has custom accordion implementation
- **Solution**: Complete refactor to use shadcn `<Accordion>` component
- **Testing**: Ensure expand/collapse animations work correctly

---

## SECTION 14: NEXT STEPS

1. **Immediate** (This week)
   - Review this report with team
   - Prioritize Phase 1 files
   - Create git branch for Phase 1
   - Assign developers to Phase 1 components

2. **Short-term** (Weeks 1-2)
   - Execute Phase 1 and Phase 2 migrations
   - Run comprehensive testing
   - Create PR for review

3. **Medium-term** (Weeks 3-4)
   - Execute Phase 3 and Phase 4 migrations
   - Remove deprecated dependencies
   - Final testing and deployment

4. **Documentation**
   - Update AGENTS.md with shadcn patterns
   - Create team guide for new shadcn components
   - Document custom variants and patterns

---

## CONTACT & SUPPORT

For questions during migration:
- Check shadcn/ui docs: https://ui.shadcn.com/
- Review Radix UI accessibility docs: https://www.radix-ui.com/
- Refer to React Hook Form integration: https://react-hook-form.com/form-builder
- Review existing shadcn implementations in `src/components/ui/`

---

**Report Version**: 1.0  
**Last Updated**: March 11, 2026  
**Status**: Ready for Implementation
