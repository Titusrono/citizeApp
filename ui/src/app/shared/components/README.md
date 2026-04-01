# Shared Dialog & Modal Components

This folder contains reusable dialog and modal components that can be used across the entire application.

## Components Available

### 1. ConfirmDialogComponent
A customizable confirmation dialog for destructive actions.

#### Usage Example:
```typescript
import { ConfirmDialogComponent } from '../../shared/components';

// In your component
showConfirmDialog = false;
confirmDialogTitle = 'Delete Item';
confirmDialogMessage = 'Are you sure you want to delete this item?';
isDeleting = false;

onDelete(id: string) {
  this.pendingDeleteId = id;
  this.showConfirmDialog = true;
}

onConfirmDelete() {
  this.isDeleting = true;
  // Perform delete operation
  this.service.delete(this.pendingDeleteId).subscribe({
    next: () => {
      this.showConfirmDialog = false;
      this.isDeleting = false;
    },
    error: () => this.isDeleting = false
  });
}

onCancelDelete() {
  this.showConfirmDialog = false;
  this.pendingDeleteId = null;
}
```

#### In Template:
```html
<app-confirm-dialog
  [isVisible]="showConfirmDialog"
  [title]="confirmDialogTitle"
  [message]="confirmDialogMessage"
  confirmText="Delete"
  cancelText="Cancel"
  [isLoading]="isDeleting"
  [isDangerous]="true"
  (confirm)="onConfirmDelete()"
  (cancel)="onCancelDelete()"
></app-confirm-dialog>
```

### 2. ViewModalComponent
A reusable modal for displaying detailed information.

#### Usage Example:
```typescript
import { ViewModalComponent } from '../../shared/components';

// In your component
showViewModal = false;
viewModalTitle = '';
viewModalData: any = {};
viewModalFields: any[] = [];

onView(item: any) {
  this.viewModalTitle = item.name || 'Item Details';
  this.viewModalData = item;
  this.viewModalFields = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description', type: 'longtext' },
    { key: 'createdAt', label: 'Created Date', type: 'date' },
    { key: 'email', label: 'Email', type: 'email' }
  ];
  this.showViewModal = true;
}

onCloseViewModal() {
  this.showViewModal = false;
}
```

#### In Template:
```html
<app-view-modal
  [isVisible]="showViewModal"
  [title]="viewModalTitle"
  [data]="viewModalData"
  [fields]="viewModalFields"
  (close)="onCloseViewModal()"
></app-view-modal>
```

## Field Configuration

### Field Types
- `text` - Plain text (default)
- `date` - Formatted date/time
- `email` - Email format
- `longtext` - Multi-line text with scrolling

### Field Properties
```typescript
{
  key: string;              // Property key from data object
  label: string;            // Display label
  type?: 'text' | 'date' | 'email' | 'longtext';  // Field type
  format?: (value: any) => string;  // Custom formatting function
}
```

## Example Implementation

Both petition modules (admin and citizen) use these components for:
- View petition details
- Confirm delete actions

## Styling

Both components include:
- Responsive design (mobile-friendly)
- Smooth animations
- Professional styling
- Dark mode compatibility (follows theme)

## Benefits

✅ Code reusability across modules
✅ Consistent user experience
✅ Easy to maintain and update
✅ Accessibility built-in
✅ Performance optimized
