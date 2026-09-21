import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'

const ELEMENT_ID = 'barcode-scanner-view'
const BARCODE_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
]

// Kamera-Overlay zum Scannen von Produkt-Barcodes (EAN/UPC).
export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(ELEMENT_ID, { formatsToSupport: BARCODE_FORMATS, verbose: false })
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 130 } },
        (decodedText) => onScan(decodedText),
        () => {},
      )
      .catch(() => setError('Kein Kamerazugriff möglich. Erlaube den Zugriff in den Browser-Einstellungen.'))

    return () => {
      scanner.stop().then(() => scanner.clear()).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div className="scanner-box" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <strong>Barcode scannen</strong>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Schließen">
            ✕
          </button>
        </div>
        {error ? (
          <p className="empty" style={{ padding: '1rem' }}>
            {error}
          </p>
        ) : (
          <>
            <div id={ELEMENT_ID} className="scanner-video" />
            <p className="empty" style={{ padding: '0 0.9rem 0.9rem' }}>
              Barcode der Verpackung in den Rahmen halten.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
