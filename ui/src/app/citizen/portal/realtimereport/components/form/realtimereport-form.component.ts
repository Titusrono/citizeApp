import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormErrors {
  location?: string;
  description?: string;
  category?: string;
}

@Component({
  selector: 'app-realtimereport-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './realtimereport-form.component.html',
  styleUrls: ['./realtimereport-form.component.scss']
})
export class RealtimereportFormComponent {
  @Input() data: any = {
    description: '',
    location: '',
    category: '',
    images: [],
    imagePreview: [] // For showing image previews
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Form validation and state
  errors: FormErrors = {};
  touched: { [key: string]: boolean } = {};
  isSubmitting = false;
  uploadProgress = 0;
  isGettingLocation = false;
  locationError = '';

  // Category options
  categories = [
    { value: 'pothole', label: 'Pothole' },
    { value: 'flooding', label: 'Flooding' },
    { value: 'sanitation', label: 'Sanitation' },
    { value: 'damaged-sign', label: 'Damaged Sign' },
    { value: 'streetlight', label: 'Street Light' },
    { value: 'other', label: 'Other' }
  ];

  /**
   * Validate a single field
   */
  validateField(fieldName: string): boolean {
    const value = this.data[fieldName]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'location':
        if (!value) {
          this.errors.location = 'Location is required';
        } else if (value.length < 3) {
          this.errors.location = 'Please provide a more specific location';
        }
        break;

      case 'description':
        if (!value) {
          this.errors.description = 'Description is required';
        } else if (value.length < 10) {
          this.errors.description = 'Description must be at least 10 characters';
        } else if (value.length > 1000) {
          this.errors.description = 'Description must not exceed 1000 characters';
        }
        break;

      case 'category':
        if (!this.data.category) {
          this.errors.category = 'Please select a category';
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  /**
   * Validate entire form
   */
  validateForm(): boolean {
    const fields = ['location', 'description', 'category'];
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Mark field as touched to show errors
   */
  markFieldTouched(fieldName: string): void {
    this.touched[fieldName] = true;
    this.validateField(fieldName);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Validate all fields
    if (!this.validateForm()) {
      Object.keys(this.data).forEach(key => {
        this.touched[key] = true;
      });
      return;
    }

    this.isSubmitting = true;
    // Create clean payload with ONLY valid DTO fields
    const submitData = {
      description: this.data.description,
      location: this.data.location,
      category: this.data.category,
      images: this.data.imagePreview && this.data.imagePreview.length > 0 ? this.data.imagePreview : []
    };

    setTimeout(() => {
      this.submit.emit(submitData);
      this.isSubmitting = false;
    }, 500);
  }

  /**
   * Reset form to initial state
   */
  onReset(): void {
    this.data = {
      description: '',
      location: '',
      category: '',
      images: [],
      imagePreview: []
    };
    this.errors = {};
    this.touched = {};
    this.uploadProgress = 0;
  }

  /**
   * Close modal
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Get current location using Geolocation API
   */
  getCurrentLocation(): void {
    this.isGettingLocation = true;
    this.locationError = '';

    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by your browser';
      this.isGettingLocation = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        this.convertCoordinatesToAddress(latitude, longitude);
      },
      (error: GeolocationPositionError) => {
        this.isGettingLocation = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Location permission denied. Please enable it in settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Location is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            this.locationError = 'Location request timed out. Please try again.';
            break;
          default:
            this.locationError = 'Unable to get your location. Please try again.';
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Convert coordinates to human-readable address using reverse geocoding
   * Using OpenStreetMap's Nominatim service (free, no API key required)
   */
  convertCoordinatesToAddress(latitude: number, longitude: number): void {
    // Format coordinates for Nominatim
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    // Fetch address from Nominatim
    fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CitizenConnect-App'
      }
    })
      .then(response => response.json())
      .then(data => {
        let address = '';

        // Build address from components (preference order)
        if (data.address) {
          const addressParts = [];

          // Try to get specific street or landmark
          if (data.address.road) addressParts.push(data.address.road);
          if (data.address.building) addressParts.push(data.address.building);
          if (data.address.neighbourhood) addressParts.push(data.address.neighbourhood);
          if (data.address.suburb) addressParts.push(data.address.suburb);
          if (data.address.city) addressParts.push(data.address.city);

          address = addressParts.join(', ');
        }

        // Fallback to display name if no components
        if (!address && data.display_name) {
          address = data.display_name.split(',').slice(0, 3).join(',').trim();
        }

        // Fallback to coordinates
        if (!address) {
          address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        this.data.location = address;
        this.locationError = '';
        this.isGettingLocation = false;
        this.markFieldTouched('location');
      })
      .catch(() => {
        // If reverse geocoding fails, use coordinates
        this.data.location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        this.isGettingLocation = false;
        this.markFieldTouched('location');
      });
  }

  /**
   * Handle image file selection and preview
   */
  onImageSelected(event: any): void {
    const files = event.target.files;
    if (!files) return;

    this.data.imagePreview = [];

    // Create base64 preview URLs for images
    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.data.imagePreview.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Remove image from preview
   */
  removeImage(index: number): void {
    this.data.imagePreview.splice(index, 1);
  }

  /**
   * Get character count for description
   */
  getDescriptionCharCount(): number {
    return this.data.description?.length || 0;
  }

  /**
   * Get field error status
   */
  hasError(fieldName: string): boolean {
    return this.touched[fieldName] && !!this.errors[fieldName as keyof FormErrors];
  }

  /**
   * Get field success status
   */
  hasSuccess(fieldName: string): boolean {
    return this.touched[fieldName] && !this.errors[fieldName as keyof FormErrors] && !!this.data[fieldName]?.toString().trim();
  }
}
