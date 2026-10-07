import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  AlertCircle,
} from 'lucide-react'
import * as XLSX from 'xlsx'

import {
  bulkUploadZones,
  downloadZoneTemplate,
} from '../../services/zoneService'

const REQUIRED_COLUMNS = [
  'zone_name',
  'zone_leader',
]

const OPTIONAL_COLUMNS = [
  'zone_code',
  'description',
  'status',
]

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function cellValue(row, indexMap, key) {
  const index = indexMap[key]
  if (index === undefined) return ''
  return String(row[index] ?? '').trim()
}

export default function BulkZoneUploadModal({
  open,
  plants = [],
  onClose,
  onUploaded,
}) {
  const [plantId, setPlantId] = useState('')
  const [file, setFile] = useState(null)
  const [previewRows, setPreviewRows] = useState([])
  const [previewError, setPreviewError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const selectedPlant = useMemo(
    () =>
      plants.find(
        (plant) => String(plant.id) === String(plantId)
      ),
    [plants, plantId]
  )

  const validPreviewCount = previewRows.filter(
    (row) => row.isValid
  ).length

  const invalidPreviewCount = previewRows.filter(
    (row) => !row.isValid
  ).length

  if (!open) return null

  function resetFileState() {
    setFile(null)
    setPreviewRows([])
    setPreviewError('')
    setResult(null)
    setError('')
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null

    setFile(selectedFile)
    setResult(null)
    setError('')
    setPreviewError('')
    setPreviewRows([])

    if (!selectedFile) return

    const fileName = selectedFile.name.toLowerCase()

    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setPreviewError('Only .xlsx or .xls files are allowed.')
      return
    }

    const reader = new FileReader()

    reader.onload = (loadEvent) => {
      try {
        const workbook = XLSX.read(
          loadEvent.target.result,
          { type: 'array' }
        )

        const firstSheetName = workbook.SheetNames[0]

        if (!firstSheetName) {
          throw new Error('The Excel workbook has no sheets.')
        }

        const sheet = workbook.Sheets[firstSheetName]

        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
          raw: false,
        })

        if (!rows.length) {
          throw new Error('The Excel file is empty.')
        }

        const headers = rows[0].map(normalizeHeader)

        const indexMap = {}
        headers.forEach((header, index) => {
          if (header) {
            indexMap[header] = index
          }
        })

        const missingColumns = REQUIRED_COLUMNS.filter(
          (column) => indexMap[column] === undefined
        )

        if (missingColumns.length > 0) {
          throw new Error(
            `Missing required column(s): ${missingColumns.join(', ')}`
          )
        }

        const dataRows = rows
          .slice(1)
          .filter((row) =>
            Array.isArray(row) &&
            row.some((value) => String(value ?? '').trim() !== '')
          )

        if (!dataRows.length) {
          throw new Error('The Excel file contains no Zone rows.')
        }

        const parsed = dataRows.map((row, index) => {
          const excelRow = index + 2

          const zoneName = cellValue(
            row,
            indexMap,
            'zone_name'
          )

          const zoneCode = cellValue(
            row,
            indexMap,
            'zone_code'
          )

          const description = cellValue(
            row,
            indexMap,
            'description'
          )

          const zoneLeader = cellValue(
            row,
            indexMap,
            'zone_leader'
          )

          const status = cellValue(
            row,
            indexMap,
            'status'
          ) || 'Active'

          const rowErrors = []

          if (!zoneName) {
            rowErrors.push('Zone name is required.')
          }

          if (!zoneLeader) {
            rowErrors.push(
              'Zone Leader name is required.'
            )
          }

          return {
            rowNumber: excelRow,
            zoneName,
            zoneCode,
            description,
            zoneLeader,
            status,
            isValid: rowErrors.length === 0,
            errors: rowErrors,
          }
        })

        setPreviewRows(parsed)
      } catch (err) {
        console.error('Failed to preview Excel:', err)
        setPreviewError(
          err?.message ||
            'Unable to read the Excel file.'
        )
      }
    }

    reader.onerror = () => {
      setPreviewError(
        'Unable to read the selected Excel file.'
      )
    }

    reader.readAsArrayBuffer(selectedFile)
  }

  async function handleTemplate() {
    try {
      setDownloading(true)
      setError('')

      const blob = await downloadZoneTemplate()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = 'zone_import_template.xlsx'

      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      URL.revokeObjectURL(url)
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to download the template.'
      )
    } finally {
      setDownloading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setResult(null)

    if (!plantId) {
      setError('Please select a Plant.')
      return
    }

    if (!file) {
      setError('Please select an Excel file.')
      return
    }

    if (previewRows.length === 0) {
      setError('Please select a valid Excel file with Zone rows.')
      return
    }

    if (invalidPreviewCount > 0) {
      setError(
        'Please fix the highlighted Excel rows before uploading.'
      )
      return
    }

    setSubmitting(true)

    try {
      const data = await bulkUploadZones(
        plantId,
        file
      )

      setResult(data)

      if (data.created_count > 0) {
        onUploaded?.()
      }

      if (data.error_count === 0) {
        setTimeout(() => {
          onClose?.()
        }, 700)
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to upload Zones.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    if (submitting) return

    setPlantId('')
    resetFileState()
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-ink2">
              Bulk Upload Zones
            </h2>
            <p className="mt-1 text-sm text-ink2-secondary">
              Create multiple Zones and assign a Zone Leader to each row.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg p-2 text-ink2-muted hover:bg-canvas hover:text-ink2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-5 px-6 py-6">
            <button
              type="button"
              onClick={handleTemplate}
              disabled={downloading}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-line-strong bg-canvas px-4 py-4 text-left transition hover:border-brand hover:bg-brand-soft"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-soft text-success">
                  <FileSpreadsheet className="h-5 w-5" />
                </span>

                <span>
                  <span className="block text-sm font-semibold text-ink2">
                    Download Excel Template
                  </span>
                  <span className="block text-xs text-ink2-muted">
                    Includes Zone Code, Description and Zone Leader name.
                  </span>
                </span>
              </span>

              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
              ) : (
                <Download className="h-4 w-4 text-brand" />
              )}
            </button>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink2">
                Plant *
              </label>

              <select
                value={plantId}
                onChange={(event) => setPlantId(event.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
              >
                <option value="">Select Plant</option>

                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                    {plant.code ? ` (${plant.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlant && (
              <div className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand">
                All uploaded Zones will be created under{' '}
                <strong>{selectedPlant.name}</strong>.
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink2">
                Excel File *
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line-strong bg-canvas px-5 py-8 text-center transition hover:border-brand hover:bg-brand-soft">
                <Upload className="mb-3 h-7 w-7 text-brand" />

                <span className="text-sm font-semibold text-ink2">
                  {file
                    ? file.name
                    : 'Choose Excel file'}
                </span>

                <span className="mt-1 text-xs text-ink2-muted">
                  .xlsx or .xls files only
                </span>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-4 text-xs text-ink2-secondary">
              <div className="font-semibold text-ink2">
                Excel columns
              </div>

              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                <span>• zone_name — required</span>
                <span>• zone_leader — required</span>
                <span>• zone_code — optional</span>
                <span>• description — optional</span>
                <span>• status — optional, Active/Inactive</span>
              </div>
            </div>

            {previewError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{previewError}</span>
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-line">
                <div className="flex flex-col gap-2 border-b border-line bg-canvas px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink2">
                      Excel Preview
                    </div>
                    <div className="text-xs text-ink2-muted">
                      {previewRows.length} Zone row(s) detected
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-success-soft px-2.5 py-1 text-success">
                      {validPreviewCount} ready
                    </span>

                    {invalidPreviewCount > 0 && (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-600">
                        {invalidPreviewCount} needs attention
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-[330px] overflow-auto">
                  <table className="min-w-[1000px] w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-surface">
                      <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-wide text-ink2-muted">
                        <th className="px-4 py-3">Row</th>
                        <th className="px-4 py-3">Zone Name</th>
                        <th className="px-4 py-3">Zone Code</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Zone Leader</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Validation</th>
                      </tr>
                    </thead>

                    <tbody>
                      {previewRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={`border-b border-line last:border-0 ${
                            row.isValid
                              ? ''
                              : 'bg-red-50/60'
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-ink2-muted">
                            {row.rowNumber}
                          </td>

                          <td className="px-4 py-3 font-semibold text-ink2">
                            {row.zoneName || '—'}
                          </td>

                          <td className="px-4 py-3 text-ink2-secondary">
                            {row.zoneCode || '—'}
                          </td>

                          <td className="max-w-[260px] px-4 py-3 text-ink2-secondary">
                            <div className="line-clamp-2">
                              {row.description || '—'}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            {row.zoneLeader ? (
                              <div className="font-semibold text-ink2">
                                {row.zoneLeader}
                              </div>
                            ) : (
                              <span className="font-semibold text-danger">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${
                                row.status.toLowerCase() === 'inactive'
                                  ? 'bg-canvas text-ink2-muted'
                                  : 'bg-success-soft text-success'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                                <CheckCircle2 className="h-4 w-4" />
                                Ready
                              </span>
                            ) : (
                              <div className="space-y-1 text-danger">
                                {row.errors.map(
                                  (message, index) => (
                                    <div key={index}>
                                      {message}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {result && (
              <div className="rounded-xl border border-line bg-canvas p-4 text-sm">
                <div className="font-semibold text-ink2">
                  {result.created_count} Zone(s) created
                </div>

                {result.error_count > 0 && (
                  <div className="mt-1 text-danger">
                    {result.error_count} row(s) could not be imported.
                  </div>
                )}

                {result.errors?.length > 0 && (
                  <div className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs text-ink2-secondary">
                    {result.errors.map((item, index) => (
                      <div key={index}>
                        Row {item.row}: {item.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 flex shrink-0 justify-end gap-3 border-t border-line bg-surface px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink2-secondary hover:bg-canvas"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !plantId ||
                !file ||
                previewRows.length === 0 ||
                invalidPreviewCount > 0
              }
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {submitting
                ? 'Uploading...'
                : `Upload ${previewRows.length || ''} Zone${previewRows.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
