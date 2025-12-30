# Testing the New Flashcard UI

This document explains how to test the new flashcard UI component without affecting the main application.

## Quick Test Instructions

1. Open `src/App.jsx`

2. Find the import section near the top (around line 13) and swap the import:
   ```javascript
   // Comment out this line:
   // import MobileFlashcardView from './components/MobileFlashcardView';
   
   // Uncomment this line:
   import NewFlashcardView from './components/NewFlashcardView';
   ```

3. Find where `MobileFlashcardView` is used (around line 1003) and replace it:
   ```javascript
   // Replace this:
   <MobileFlashcardView
   
   // With this:
   <NewFlashcardView
   ```

4. Save the file and refresh your browser

5. **Important**: The new component will only show on mobile view. Make sure you're testing on a mobile device or have the view mode set to mobile.

## Features of the New UI

- **Blue background** with a white flashcard in the center
- **Front side**: 
  - Vitals display (adjusted colors for white background)
  - Patient information
  - Physical exam buttons
  - Test ordering interface
  - Test results display
- **Back side**:
  - Diagnosis selection
  - Treatment plan
  - All test results
- **Flip functionality**: Click "View Diagnosis" to flip to the back, "Back to Tests" to flip to front

## Reverting Changes

To revert back to the original component:
1. Restore the original import
2. Restore the original component usage
3. Save and refresh

## Note

This is a testing component and will NOT be pushed to the website automatically. You can develop and test freely without affecting the live site.

