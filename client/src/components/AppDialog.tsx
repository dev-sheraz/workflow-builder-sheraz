// Modal dialog component - reusable dialog with backdrop and customizable content
import React from "react";

/**
 * Props interface for Dialog component
 */
interface DialogProps {
  open: boolean;                  // Whether the dialog is visible
  onClose: () => void;            // Function to call when dialog should close
  title?: string;                 // Optional dialog title
  children?: React.ReactNode;     // Dialog body content
  footer?: React.ReactNode;       // Optional footer content (buttons, etc.)
  showCloseButton?: boolean;      // Whether to show the X close button
}

/**
 * Dialog component - Modal dialog with backdrop
 *
 * Features:
 * 1. Modal overlay with backdrop click to close
 * 2. Customizable title, body, and footer
 * 3. Optional close button in header
 * 4. Click event bubbling prevention
 * 5. Responsive design with max width
 *
 * @param {DialogProps} props - Component props
 * @returns {JSX.Element | null} Dialog component or null if closed
 */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
}: DialogProps) {
  // Don't render anything if dialog is closed
  if (!open) return null;

  return (
    // Modal backdrop - covers entire screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // Close dialog when clicking backdrop
    >
      {/* Dialog container - prevents backdrop click when clicking inside */}
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dialog
      >
        {/* Dialog Header - title and close button */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Dialog Body - main content */}
        <div className="mb-4">{children}</div>

        {/* Dialog Footer - action buttons */}
        {footer && <div className="flex justify-end space-x-2">{footer}</div>}
      </div>
    </div>
  );
}
