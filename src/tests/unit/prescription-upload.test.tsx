import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PrescriptionUploader from '@/components/patient/PrescriptionUploader'

describe('PrescriptionUploader Component', () => {
  const defaultProps = {
    uploadedFile: null,
    filePreviewUrl: null,
    onFileChange: vi.fn(),
    onRemove: vi.fn(),
    isRequired: false,
    uploadProgress: 0,
    isUploading: false,
    error: null,
    isNetworkError: false,
    onRetry: vi.fn(),
    uploadedSuccess: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload dropzone with instructions when no file is selected', () => {
    render(<PrescriptionUploader {...defaultProps} />)
    expect(screen.getByTestId('prescription-uploader')).toBeInTheDocument()
    expect(screen.getByText(/click to upload prescription/i)).toBeInTheDocument()
    expect(screen.getByText(/supports pdf, png, jpg formats up to 10mb/i)).toBeInTheDocument()
    expect(screen.getByTestId('prescription-file-input')).toBeInTheDocument()
  })

  it('displays prescription required notice when isRequired is true', () => {
    render(<PrescriptionUploader {...defaultProps} isRequired={true} />)
    expect(screen.getByText(/prescription required/i)).toBeInTheDocument()
    expect(screen.getByText(/this medication is regulated by the ministry of health/i)).toBeInTheDocument()
  })

  it('renders uploaded file details when a file is provided', () => {
    const mockFile = new File(['prescription contents'], 'rx-order.pdf', { type: 'application/pdf' })
    render(
      <PrescriptionUploader
        {...defaultProps}
        uploadedFile={mockFile}
      />
    )

    expect(screen.getByText('rx-order.pdf')).toBeInTheDocument()
    expect(screen.getByText(/replace/i)).toBeInTheDocument()
    expect(screen.getByText(/remove/i)).toBeInTheDocument()
  })

  it('calls onFileChange when selecting a file through the dropzone input', () => {
    const onFileChange = vi.fn()
    render(<PrescriptionUploader {...defaultProps} onFileChange={onFileChange} />)

    const input = screen.getByTestId('prescription-file-input')
    const file = new File(['dummy'], 'sample.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(onFileChange).toHaveBeenCalledTimes(1)
  })

  it('calls onRemove when clicking the remove button', () => {
    const onRemove = vi.fn()
    const mockFile = new File(['doc'], 'rx.pdf', { type: 'application/pdf' })
    render(
      <PrescriptionUploader
        {...defaultProps}
        uploadedFile={mockFile}
        onRemove={onRemove}
      />
    )

    const removeBtn = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(removeBtn)

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('displays image preview when filePreviewUrl is provided', () => {
    const mockFile = new File(['image'], 'rx.png', { type: 'image/png' })
    render(
      <PrescriptionUploader
        {...defaultProps}
        uploadedFile={mockFile}
        filePreviewUrl="blob:http://localhost/test-preview"
      />
    )

    const img = screen.getByAltText('Prescription preview')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'blob:http://localhost/test-preview')
  })

  it('displays progress bar and uploading text when upload is in flight', () => {
    const mockFile = new File(['pdf data'], 'rx.pdf', { type: 'application/pdf' })
    render(
      <PrescriptionUploader
        {...defaultProps}
        uploadedFile={mockFile}
        isUploading={true}
        uploadProgress={45}
      />
    )

    expect(screen.getByText(/uploading 45%/i)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45')
  })

  it('disables replace and remove actions while upload is in progress to prevent duplicates', () => {
    const mockFile = new File(['pdf data'], 'rx.pdf', { type: 'application/pdf' })
    render(
      <PrescriptionUploader
        {...defaultProps}
        uploadedFile={mockFile}
        isUploading={true}
        uploadProgress={60}
      />
    )

    expect(screen.queryByText(/replace/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('displays ready badge when uploadedSuccess is true', () => {
    const mockFile = new File(['pdf data'], 'rx.pdf', { type: 'application/pdf' })
    render(
      <PrescriptionUploader
        {...defaultProps}
        uploadedFile={mockFile}
        uploadedSuccess={true}
      />
    )

    expect(screen.getByText(/ready/i)).toBeInTheDocument()
  })

  it('displays patient-friendly error message with role="alert"', () => {
    render(
      <PrescriptionUploader
        {...defaultProps}
        error="Please upload a valid PDF, JPG, or PNG prescription."
      />
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Please upload a valid PDF, JPG, or PNG prescription.')
  })

  it('renders retry button and triggers onRetry when retry button is clicked', () => {
    const onRetry = vi.fn()
    render(
      <PrescriptionUploader
        {...defaultProps}
        error="Prescription upload failed due to connection issues. Please try again."
        isNetworkError={true}
        onRetry={onRetry}
      />
    )

    expect(screen.getByTestId('prescription-error')).toBeInTheDocument()
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    expect(retryBtn).toBeInTheDocument()

    fireEvent.click(retryBtn)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('retains the uploaded file in view even when error occurs so patient does not lose state', () => {
    const mockFile = new File(['prescription file'], 'my-prescription.pdf', { type: 'application/pdf' })
    render(
      <PrescriptionUploader
        {...defaultProps}
        uploadedFile={mockFile}
        error="Server temporarily unavailable. Please retry."
      />
    )

    expect(screen.getByText('my-prescription.pdf')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Server temporarily unavailable. Please retry.')
  })
})
