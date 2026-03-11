# shadcn/ui Migration Checklist

## Pre-Migration Setup

### Week 0 - Preparation
- [ ] Review all migration reports
- [ ] Discuss timeline with team
- [ ] Create feature branch: `git checkout -b feat/shadcn-migration`
- [ ] Set up test environment
- [ ] Run baseline tests: `npm test -- --watchAll=false --coverage`
- [ ] Document current bundle size

---

## PHASE 1: Critical Foundation (Week 1)

### Component 1: PrimaryInfoFormComponent.tsx
- [ ] Review current implementation
- [ ] Replace 8 raw inputs with `<Input>`
- [ ] Replace 3 raw selects with `<Select>`
- [ ] Replace 3 raw labels with `<Label>`
- [ ] Test form validation
- [ ] Test styling and responsive design
- [ ] Run tests: `npm test -- --testPathPattern="PrimaryInfoFormComponent" --watchAll=false`
- [ ] Commit: `git commit -m "refactor: migrate PrimaryInfoFormComponent to shadcn"`

### Component 2: StateDropdownComponent.tsx
- [ ] Replace 1 raw select with `<Select>`
- [ ] Replace 1 raw label with `<Label>`
- [ ] Verify integration with dependent components
- [ ] Test dropdown functionality
- [ ] Commit: `git commit -m "refactor: migrate StateDropdownComponent to shadcn"`

### Component 3: AddressComponent.tsx
- [ ] Replace 4 raw inputs with `<Input>`
- [ ] Add proper `<Label>` components
- [ ] Test Google Places integration
- [ ] Verify styling
- [ ] Commit: `git commit -m "refactor: migrate AddressComponent to shadcn"`

### Component 4: ContactInformationComponent.tsx
- [ ] Replace 3 checkboxes with `<Checkbox>`
- [ ] Add `<Label>` components with proper asChild pattern
- [ ] Test checkbox states
- [ ] Commit: `git commit -m "refactor: migrate ContactInformationComponent to shadcn"`

### Component 5: BaseComponentTemplate.tsx
- [ ] Update template to use `<Input>` and `<Select>`
- [ ] Update documentation
- [ ] Verify dependent components still work
- [ ] Commit: `git commit -m "refactor: migrate BaseComponentTemplate to shadcn"`

### Phase 1 Verification
- [ ] Run full test suite: `npm test -- --watchAll=false`
- [ ] Check TypeScript: `npm run build`
- [ ] Verify styling in browser
- [ ] Test keyboard navigation
- [ ] Create PR and request review

---

## PHASE 2: Events & Authentication (Week 2)

### Component 6: EventCardComponent.tsx
- [ ] Remove `react-router-bootstrap` LinkContainer import
- [ ] Replace 3 raw buttons with `<Button>`
- [ ] Replace LinkContainer with `<Button asChild>` + React Router `<Link>`
- [ ] Remove "btn" Bootstrap classes
- [ ] Test navigation
- [ ] Test styling
- [ ] Commit: `git commit -m "refactor: migrate EventCardComponent to shadcn"`

### Component 7: EventListComponent.tsx
- [ ] Replace select with `<Select>`
- [ ] Replace raw labels with `<Label>`
- [ ] Replace radio buttons with `<RadioGroup>` or `<ToggleGroup>`
- [ ] Remove "form-control" and "form-group" classes
- [ ] Test filter functionality
- [ ] Commit: `git commit -m "refactor: migrate EventListComponent to shadcn"`

### Component 8: SignInFormComponent.tsx
- [ ] Replace 2 navigation buttons with `<Button variant="link">`
- [ ] Test styling and links
- [ ] Commit: `git commit -m "refactor: migrate SignInFormComponent to shadcn"`

### Component 9: SignUpFormComponent.tsx
- [ ] Replace 1 navigation button with `<Button variant="link">`
- [ ] Test styling and links
- [ ] Commit: `git commit -m "refactor: migrate SignUpFormComponent to shadcn"`

### Component 10: EventNearByComponent.tsx
- [ ] Replace custom accordion buttons with `<Accordion>` component
- [ ] Update state management
- [ ] Test expand/collapse functionality
- [ ] Verify animations work correctly
- [ ] Commit: `git commit -m "refactor: migrate EventNearByComponent to Accordion"`

### Phase 2 Verification
- [ ] Run full test suite: `npm test -- --watchAll=false`
- [ ] Check TypeScript: `npm run build`
- [ ] Test event navigation and interactions
- [ ] Test authentication forms
- [ ] Create PR and request review

---

## PHASE 3: Households & General (Week 3)

### Component 11: HouseholdSignUpWrapper.tsx
- [ ] Replace 2 buttons with `<Button>`
- [ ] Test form submission
- [ ] Commit: `git commit -m "refactor: migrate HouseholdSignUpWrapper buttons to shadcn"`

### Component 12: HouseholdCompletionPrompt.tsx
- [ ] Replace 2 close icon buttons with `<Button variant="ghost" size="icon">`
- [ ] Test modal functionality
- [ ] Commit: `git commit -m "refactor: migrate HouseholdCompletionPrompt to shadcn"`

### Component 13: HouseHoldEligibilityComponent.tsx
- [ ] Replace 1 link button with `<Button variant="link">`
- [ ] Commit: `git commit -m "refactor: migrate HouseHoldEligibilityComponent to shadcn"`

### Component 14: FamilyContainer.tsx
- [ ] Replace 1 submit button with `<Button type="submit">`
- [ ] Test form submission
- [ ] Commit: `git commit -m "refactor: migrate FamilyContainer submit button to shadcn"`

### Component 15: ResourceListComponent.tsx
- [ ] Replace LinkContainer with `<Button asChild>` + React Router `<Link>`
- [ ] Test navigation
- [ ] Commit: `git commit -m "refactor: migrate ResourceListComponent LinkContainer to shadcn"`

### Phase 3 Verification
- [ ] Run full test suite: `npm test -- --watchAll=false`
- [ ] Check TypeScript: `npm run build`
- [ ] Test household workflows
- [ ] Create PR and request review

---

## PHASE 4: Remaining Components (Week 4)

### Component 16: HeaderComponent.tsx
- [ ] Review and migrate any raw buttons
- [ ] Test header interactions
- [ ] Commit: `git commit -m "refactor: migrate HeaderComponent to shadcn"`

### Component 17: GooglePlacesAutocomplete.tsx
- [ ] Wrap input with `<Input>` component
- [ ] Ensure autocomplete functionality still works
- [ ] Commit: `git commit -m "refactor: wrap GooglePlacesAutocomplete input with shadcn"`

### Component 18: SearchComponent.tsx
- [ ] Replace raw inputs with `<Input>`
- [ ] Test search functionality
- [ ] Commit: `git commit -m "refactor: migrate SearchComponent inputs to shadcn"`

### Component 19: ResetPasswordFormComponent.tsx
- [ ] Replace back button with `<Button variant="ghost">`
- [ ] Test styling and navigation
- [ ] Commit: `git commit -m "refactor: migrate ResetPasswordFormComponent to shadcn"`

### Component 20: ConfirmResetPasswordFormComponent.tsx
- [ ] Replace back button with `<Button variant="ghost">`
- [ ] Test styling and navigation
- [ ] Commit: `git commit -m "refactor: migrate ConfirmResetPasswordFormComponent to shadcn"`

### Phase 4 Verification
- [ ] Run full test suite: `npm test -- --watchAll=false`
- [ ] Check TypeScript: `npm run build`
- [ ] Visual regression testing
- [ ] Create PR and request review

---

## Post-Migration Cleanup

### Clean Up Dependencies
- [ ] Remove `react-bootstrap` from package.json
- [ ] Remove `react-router-bootstrap` from package.json
- [ ] Remove `bootstrap` from package.json (if not used elsewhere)
- [ ] Run `npm install` to update lock file
- [ ] Test that application still works

### Update Documentation
- [ ] Update AGENTS.md with shadcn patterns
- [ ] Create shadcn component usage guide
- [ ] Document custom Button variants
- [ ] Update component naming conventions
- [ ] Commit: `git commit -m "docs: update AGENTS.md and component guidelines"`

### Final Testing & Verification
- [ ] Full test suite: `npm test -- --watchAll=false`
- [ ] Build: `npm run build`
- [ ] Bundle size analysis
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Mobile responsive testing
- [ ] Accessibility audit: keyboard, screen readers

### Deployment
- [ ] Merge feature branch
- [ ] Deploy to staging
- [ ] QA testing in staging
- [ ] Deploy to production
- [ ] Monitor for any issues

---

## Testing Checklist

### Unit Tests
- [ ] All components render without errors
- [ ] Form inputs work with React Hook Form
- [ ] Validation messages display correctly
- [ ] Form submission works
- [ ] Navigation works
- [ ] Button clicks trigger handlers
- [ ] Select dropdowns open/close
- [ ] Checkboxes toggle correctly

### Integration Tests
- [ ] Form workflows complete end-to-end
- [ ] Navigation between screens works
- [ ] State management integration works
- [ ] API calls execute correctly after input

### Visual Te
